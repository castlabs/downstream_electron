/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
const fs = require("fs");
const {net} = require('electron');
const EventEmitter = require("events").EventEmitter;
const util = require("util");
const downloadFileUtil = require("./download-file-util");

/**
 *
 * @param {string} url - remote url
 * @param {string} destFile - local url
 * @param {object} options - options
 * @constructor
 */
function DownloadFileNoHead (url, destFile, options) {
  this._url = url;
  this._destFile = destFile;
  this._options = options;
  this._resetValues();
}

util.inherits(DownloadFileNoHead, EventEmitter);

DownloadFileNoHead.prototype._reset = function (callback) {
  const self = this;
  callback = callback || function () {};

  self._closeStreamAndRequest(function () {
    self._resetValues();
    callback();
  });
};

DownloadFileNoHead.prototype._resetValues = function () {
  this.available = 0;
  this.downloaded = 0;
  this.file_size = 0;
  this.writeProgress = 0;
};

DownloadFileNoHead.prototype._createFileStream = function (callback) {
  const self = this;
  if (!this.fileStream) {
    let destFile = this._destFile;
    self.fileStream = fs.createWriteStream(destFile, {flags: "w"});
    self.fileStream.on("error", callback);
    self.fileStream.on("open", function () {
      // for unknown reason from time to time the file descriptor of self.fileStream is null
      // when event 'open' is fired then the file descriptor is not a null anymore
      // this should fix a problem with EBADF error
      // a bug in fs ?
      self.fileStream = this;

      this.removeListener("error", callback);
      this.on("error", function (error) {
        if (error.code === "ENOSPC") {
          // no space left on disk, do not retry downloading
          self.emit("error", {message: downloadFileUtil.errors.NO_SPACE_LEFT_ERROR, data: error});
        } else {
          self._retry(downloadFileUtil.errors.FILE_WRITING_ERROR, function (retried) {
            if (!retried) {
              self.emit("error", {message: downloadFileUtil.errors.FILE_WRITING_ERROR, data: error});
            }
          });
        }
      });
      this.on("finish", function () {
        if (!self.isDownloaded()) {
          self._retry(downloadFileUtil.errors.CHUNK_SIZE_ERROR, function (retried) {
            if (!retried) {
              self._closeStreamAndRequest(function () {
                self.emit("error", {message: downloadFileUtil.errors.CHUNK_SIZE_ERROR});
              });
            }
          });
        } else {
          self.writeProgress = 1;
          self.emit("end");
        }
      });
      callback();
    });
  } else {
    callback();
  }
};

DownloadFileNoHead.prototype.isDownloaded = function () {
  return this.downloaded === this.file_size;
};

DownloadFileNoHead.prototype._retry = function (errorType, callback) {
  const self = this;
  let maxDownloadRetry;
  this._errors = this._errors || {};
  this._errors[errorType] = this._errors[errorType] || 0;
  this._errors[errorType]++;
  if (errorType === downloadFileUtil.errors.INTERNET) {
    maxDownloadRetry = this._options.maxDownloadChunkInternetRetry;
  } else {
    maxDownloadRetry = this._options.maxDownloadRetry;
  }
  if (this._errors[errorType] <= maxDownloadRetry) {
    if (self._timer) {
      clearTimeout(self._timer);
    }
    callback(true);
    self._timer = setTimeout(function () {
      // console.log("retrying chunk", errorType, self.destFile);
      self._reset(function () {
        self.start();
      });
    }, self._options.retryTimeout);
  } else {
    // console.log("not retrying chunk", errorType, self._errors[errorType]);
    callback(false);
  }
};
DownloadFileNoHead.prototype._closeStreamAndRequest = function (callback) {
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

/**
 * starts download
 * @returns {void}
 */
DownloadFileNoHead.prototype.start = function () {
  const self = this;
  let req_options = {
    timeout: this._options.timeout,
    url: this._url,
  };

  if (this._options.noCache) {
    req_options.headers = {
      'Cache-Control': 'no-cache'
    }
  }

  self._createFileStream(function (err) {
    if (err) {
      self._retry(downloadFileUtil.errors.FILE_CREATING_ERROR, function (retried) {
        if (!retried) {
          self._closeStreamAndRequest(function () {
            self.emit("error", {message: downloadFileUtil.errors.FILE_CREATING_ERROR});
          });
        }
      });
      return;
    }
    req_options.headers = req_options.headers || {};

    self._req = net.request(req_options);

    self._req.on('response', (response) => {
      response.on("error", function (error) {
        console.error('ERROR (' + self._url + ') :' + error)
        if (error.code === "ESOCKETTIMEDOUT" || error.code === "ENOTFOUND" || error.code === "ETIMEDOUT") {
          self._retry(downloadFileUtil.errors.INTERNET, function (retried) {
            if (!retried) {
              self._closeStreamAndRequest(function () {
                self.emit("error", {message: downloadFileUtil.errors.TIMEOUT, data: error});
              });
            }
          });
        } else {
          self._retry(downloadFileUtil.errors.INTERNET, function (retried) {
            if (!retried) {
              self._closeStreamAndRequest(function () {
                self.emit("error", {message: downloadFileUtil.errors.CHUNK_ERROR, data: error});
              });
            }
          });
        }
      });

      if (response && response.statusCode >= 400) {
        self._retry(downloadFileUtil.errors.INTERNET, function (retried) {
          if (!retried) {
            self._closeStreamAndRequest(function () {
              console.error(`HTTP DOWNLOAD ERROR url: ${self._url}, statusCode: ${response.statusCode}`);
              self.emit("error", {message: downloadFileUtil.errors.CHUNK_ERROR, data: response});
            });
          }
        });
      } else {
        self._headers = response.headers;
        self.file_size = Number(self._headers["content-length"]);

        response.on("data", function (data) {
          if (response.statusCode === 200 || response.statusCode === 206) {
            self.available += data.length;
            self.downloaded += data.length;
          }
        });
        response.pipe(self.fileStream);
      }
    });
    self._req.end();
  });
  return this._promise;
};

/**
 * stops download
 * @returns {void}
 */
DownloadFileNoHead.prototype.stop = function () {
  const self = this;
  this._reset(function () {
    self.emit("error", {message: downloadFileUtil.errors.ABORTED});
  });
};

module.exports = DownloadFileNoHead;
