const downloadFileUtil = require("./download-file-util");
const fs = require("fs");
const {net} = require('electron');
const EventEmitter = require("events").EventEmitter;

/**
 *
 * @param {string} url - url
 * @param {object} options - options
 * @returns {Chunk} - chunk object
 * @constructor
 */
function Chunk (url, options) {
  const self = this;
  this.url = url;
  this.options = options;
  this.endPosition = options.endPosition;
  this.startPosition = options.startPosition;
  this.bytesRangeNotAvailable = options.bytesRangeNotAvailable;
  this.reset();
  this.events = new EventEmitter();
  this._promise = new Promise(function (resolve, reject) {
    self.resolve = resolve;
    self.reject = reject;
  });
  return this;
}

Chunk.prototype._retry = function (errorType, callback) {
  const self = this;
  let maxDownloadRetry;
  this._errors = this._errors || {};
  this._errors[errorType] = this._errors[errorType] || 0;
  this._errors[errorType]++;
  if (errorType === downloadFileUtil.errors.INTERNET) {
    maxDownloadRetry = this.options.maxDownloadInternetRetry;
  } else {
    maxDownloadRetry = this.options.maxDownloadRetry;
  }
  if (this._errors[errorType] <= maxDownloadRetry) {
    if (self._timer) {
      clearTimeout(self._timer);
    }
    callback(true);
    self._timer = setTimeout(function () {
      // console.log("retrying chunk", errorType, self.destFile);
      self.reset(function () {
        self.start();
      });
    }, self.options.retryTimeout);
  } else {
    // console.log("not retrying chunk", errorType, self._errors[errorType]);
    callback(false);
  }
};

Chunk.prototype.createFileStream = function (callback) {
  const self = this;
  if (!this.fileStream) {
    let destFile = this.options.destFile;
    if (this.options.multiChunks) {
      destFile = destFile + "." + this.startPosition + "." + this.endPosition;
    }
    downloadFileUtil.checkForLocalFile(destFile, function (resumeFile, fileSize) {
      self.destFile = destFile;
      if (resumeFile) {
        if (fileSize <= self.endPosition - self.startPosition) {
          self.resumeFile = resumeFile;
          self.available = fileSize;
          self.offsetStartPosition = fileSize;
        }
      }

      self.fileStream = fs.createWriteStream(destFile, {flags: self.resumeFile ? "a" : "w"});
      self.fileStream.on("error", callback);
      self.fileStream.on("open", function () {
        // for unknown reason from time to time the file descriptor of self.fileStream is null
        // when event 'open' is fired then the file descriptor is not a null anymore
        // this should fix a problem with EBADF error
        // a bug in fs ?
        self.fileStream = this;

        this.removeListener("error", callback);
        this.on("error", function (error) {
          self._retry(downloadFileUtil.errors.FILE_WRITING_ERROR, function (retried) {
            if (!retried) {
              self.resolve(downloadFileUtil.errors.FILE_WRITING_ERROR, error);
            }
          });
        });
        this.on("finish", function () {
          if (!self.isDownloaded()) {
            self._retry(downloadFileUtil.errors.CHUNK_SIZE_ERROR, function (retried) {
              if (!retried) {
                self.closeStreamAndRequest(function () {
                  self.resolve(downloadFileUtil.errors.CHUNK_SIZE_ERROR);
                });
              }
            });
          } else {
            self.closeStreamAndRequest(self.resolve);
          }
        });
        callback();
      });
    });
  } else {
    callback();
  }
};

Chunk.prototype.isDownloaded = function () {
  return this.endPosition - this.startPosition - this.offsetStartPosition + 1 === this.downloaded;
};

Chunk.prototype.start = function () {
  const self = this;

  let req_options = {
    timeout: this.options.timeout,
    url: this.url,
  };

  self.createFileStream(function (err) {
    if (err) {
      self._retry(downloadFileUtil.errors.FILE_CREATING_ERROR, function (retried) {
        if (!retried) {
          self.closeStreamAndRequest(function () {
            self.resolve(downloadFileUtil.errors.FILE_CREATING_ERROR, err);
          });
        }
      });
      return;
    }
    req_options.headers = req_options.headers || {};

    if (!self.bytesRangeNotAvailable) {
      req_options.headers.range = "bytes=" + (self.startPosition + self.offsetStartPosition) + "-" + (self.endPosition);
    }

    self._req = net.request(req_options);
    self._req.chunkedEncoding = true;

    self._req.on('response', (response) => {
        response.on("error", function (error) {
            if (error.code === "ESOCKETTIMEDOUT" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
              self._retry(downloadFileUtil.errors.INTERNET, function (retried) {
                if (!retried) {
                  self.closeStreamAndRequest(function () {
                    self.resolve(downloadFileUtil.errors.TIMEOUT, error);
                  });
                }
              });
            } else {
              self.closeStreamAndRequest(function () {
                self.resolve(downloadFileUtil.errors.CHUNK_ERROR);
              });
            }
          });
          response.on("data", function (data) {
            if (response.statusCode === 200 || response.statusCode === 206) {
              self.available += data.length;
              self.downloaded += data.length;
              self.events.emit("download", data.length);
            }
          });
          response.pipe(self.fileStream);
    });
    self._req.end();
  });
  return this._promise;
};

Chunk.prototype.closeStreamAndRequest = function (callback) {
  const self = this;
  let timer;
  const timerTimoutMS = 300;

  function onClose () {
    clearTimeout(timer);
    if (self.fileStream) {
      self.fileStream.destroy();
      delete self.fileStream;
    }
    delete(self._req);
    callback();
  }

  if (this._req) {
    this._req.removeAllListeners();
  }
  if (this.fileStream) {
    this.fileStream.removeAllListeners();
  }
  if (this._req) {
    this._req.abort();
    if (this._req.timeoutTimer) {
      clearTimeout(this._req.timeoutTimer);
      this._req.timeoutTimer = null;
    }
  }

  if (this.fileStream) {
    timer = setTimeout(function () {
      onClose();
    }, timerTimoutMS);
    this.fileStream.end();
    this.fileStream.close(onClose);
  } else {
    delete this._req;
    callback();
  }
};

Chunk.prototype.reset = function (callback) {
  const self = this;
  callback = callback || function () {};

  self.closeStreamAndRequest(function () {
    self.offsetStartPosition = 0;
    self.available = 0;
    self.downloaded = 0;
    self.writeProgress = 0;
    self.resumeFile = false;
    callback();
  });
};

Chunk.prototype.stop = function () {
  const self = this;
  this.reset(function () {
    self.resolve(downloadFileUtil.errors.ABORTED);
  });
};

module.exports = Chunk;