const fs = require("fs");
const {net} = require('electron');
const EventEmitter = require("events").EventEmitter;
const util = require("util");
const downloadFileUtil = require("./download-file-util");
const DownloadFileChunk = require("./download-file-chunk");

/**
 *
 * @param {string} url - remote url
 * @param {string} destFile - local url
 * @param {object} options - options
 * @constructor
 */
function DownloadFile (url, destFile, options) {
  this._url = url;
  this._destFile = destFile;
  this._options = options;
  this._resetValues();
}

util.inherits(DownloadFile, EventEmitter);

/**
 *
 * @param {number} size - size of file
 * @private
 * @returns {*} - number of chunks
 */
DownloadFile.prototype._calculateChunksNumber = function (size) {
  const MB = 1024 * 1024;
  for (let i = 0, j = this._options.threads.length; i < j; i++) {
    if (size < this._options.threads[i].size * MB) {
      return this._options.threads[i].number
    }
  }
  return 1;
};

/**
 * @private
 * @returns {void}
 */
DownloadFile.prototype._concatChunks = function () {
  const self = this;
  const intervalTime = 500;
  self._chunks[0].writeProgress = 1;
  function countWriteProgress () {
    self.writeProgress = self._chunks.reduce(function (a, b) {
        return a + b.writeProgress;
      }, 0) / self._chunksNumber;
    self.emit("data");
  }
  function getWriteStream () {
    return fs.createWriteStream(self._chunks[0].destFile, {flags: "a"});
  }

  function onInterval (writeStream, currentStream) {
    self._chunks[currentStream].writeProgress = writeStream.bytesWritten / self._chunks[currentStream].available;
    if (self._chunks[currentStream].writeProgress > 1) {
      self._chunks[currentStream].writeProgress = 1;
    }
    countWriteProgress();
  }

  function pipeStream (writeStream, nextStreamNumber) {
    const chunk = self._chunks[nextStreamNumber];
    if (chunk) {
      const interval = setInterval(function () {
        onInterval(writeStream, nextStreamNumber);
      }, intervalTime);
      const readStream = fs.createReadStream(chunk.destFile);
      readStream.pipe(writeStream);
      writeStream.on("close", function () {
        clearInterval(interval);
        onInterval(writeStream, nextStreamNumber);

        writeStream.removeAllListeners();

        readStream.unpipe(writeStream);
        readStream.destroy();
        fs.unlink(chunk.destFile, function (err) {
          if (err) {
            self.emit("error", err);
          } else {
            writeStream.destroy();
            pipeStream(getWriteStream(), nextStreamNumber + 1)
          }
        });
      });
    } else {
      countWriteProgress();
      writeStream.removeAllListeners();
      writeStream.destroy();

      fs.rename(self._chunks[0].destFile, self._destFile, function (err) {
        if (err) {
          self.emit("error", err);
        } else {
          self.emit("end");
        }
      });
    }
  }

  if (self._chunks.length > 1) {
    pipeStream(getWriteStream(), 1);
  } else {
    countWriteProgress();
    self.emit("end");
  }
};

/**
 *
 * @param {number} chunkNumber - chunk number
 * @private
 * @returns {void}
 */
DownloadFile.prototype._initChunk = function (chunkNumber) {
  let options = {};
  options.bytesRangeNotAvailable = this._bytesRangeNotAvailable;
  options.destFile = this._destFile;
  options.maxDownloadRetry = this._options.maxDownloadChunkRetry;
  options.maxDownloadInternetRetry = this._options.maxDownloadChunkInternetRetry;
  options.timeout = this._options.timeout;
  options.retryTimeout = this._options.retryTimeout;

  const size = this.file_size;
  if (this._chunksNumber > 1) {
    const chunkSize = parseInt(size / this._chunksNumber, 10);
    options.startPosition = (chunkNumber) * chunkSize;
    options.multiChunks = true;
    if (chunkNumber === this._chunksNumber - 1) {
      options.endPosition = size - 1;
    } else {
      options.endPosition = options.startPosition + chunkSize - 1;
    }
  } else {
    options.startPosition = 0;
    options.endPosition = size - 1;
  }
  const chunk = new DownloadFileChunk(this._url, options);
  chunk.events.on("download", this._onChunkDownload.bind(this));
  this._chunks.push(chunk);
};

/**
 *
 * @param {object} err - error
 * @param {boolean} aborted - if failure has been called because download was aborted
 * @private
 * @returns {void}
 */
DownloadFile.prototype._onDownloadFailure = function (err, aborted) {
  this._promises = null;
  if (!aborted) {
    this._errors = this._errors || 0;
    this._errors++;
    if (this._errors <= this._options.maxDownloadRetry) {
      this._retryDownload();
    } else {
      this.emit("error", err);
    }
  } else {
    this.emit("error", err);
  }

};

/**
 *
 * @param {object} err - error
 * @private
 * @returns {void}
 */
DownloadFile.prototype._onDownloadSuccess = function (err) {
  let aborted, error;
  this._promises = null;
  err = err || [];
  for (let i = 0, j = err.length; i < j; i++) {
    if (err[i]) {
      if (err[i] === downloadFileUtil.errors.ABORTED) {
        aborted = true;
      }
      error = true;
    }
  }
  if (!error) {
    this._concatChunks();
  } else {
    this._onDownloadFailure(err, aborted);
  }
};

/**
 *
 * @param {number} downloaded - downloaded bytes
 * @private
 * @returns {void}
 */
DownloadFile.prototype._onChunkDownload = function (downloaded) {
  this.downloaded += downloaded;
  this.available = this._chunks.reduce(function (a, b) {
    return a + b.available;
  }, 0);
  this.emit("data");
};

DownloadFile.prototype._retryDownload = function () {
  // console.log("retrying download", this._destFile);
  this._resetValues();
  this.start();
};

DownloadFile.prototype._resetValues = function () {
  this.available = 0;
  this.downloaded = 0;
  this.progress = 0;
  this.file_size = 0;
  this.writeProgress = 0;
  this._chunks = [];
};

/**
 * @private
 * @returns {void}
 */
DownloadFile.prototype._startChunks = function () {
  let promises = [];
  for (let i = 0, j = this._chunks.length; i < j; i++) {
    promises.push(this._chunks[i].start());
  }
  this._promises = promises;
  Promise.all(this._promises).then(this._onDownloadSuccess.bind(this), this._onDownloadFailure.bind(this));
};

DownloadFile.prototype._startAllChunks = function () {
  for (let i = 0, j = this._chunksNumber; i < j; i++) {
    this._initChunk(i)
  }
  this._startChunks();
};

/**
 * starts download
 * @returns {void}
 */
DownloadFile.prototype.start = function () {
  const self = this;
  let req_options = Object.assign(
    {
      url: this._url,
      method: 'HEAD'
    },
    downloadFileUtil.defaultOptions
  );
  let req = net.request(req_options);

  req.on('response', (response) => {
    if (response && response.statusCode >= 400) {
      let error = response.statusMessage;
      if (error) {
        self._onDownloadFailure(error, false);
        return;
      }
    }
    response.on("error", function (error) {
      if (error) {
        self._onDownloadFailure(error, false);
      }
    });

    self._headers = response.headers;
    self.file_size = Number(self._headers["content-length"]);
    self._chunksNumber = self._calculateChunksNumber(self.file_size);

    downloadFileUtil.checkForLocalFile(self._destFile, function (exists, fileSize) {
      if (exists) {
        if (fileSize === self.file_size) {
          self.emit("end");
        } else if (fileSize > self.file_size) {
          fs.unlink(self._destFile);
          self._startAllChunks();
        } else if (fileSize < self.file_size && self._chunksNumber > 1) {
          fs.unlink(self._destFile);
          self._startAllChunks();
        } else {
          self._startAllChunks();
        }
      } else {
        self._startAllChunks();
      }
    });
  });
  req.end();
};

/**
 * stops download
 * @returns {void}
 */
DownloadFile.prototype.stop = function () {
  let promises = [];
  for (let i = 0, j = this._chunks.length; i < j; i++) {
    this._chunks[i].stop();
    if (this._chunks[i]._promise) {
      promises.push(this._chunks[i]._promise);
    }
  }
  function onStopped () {
    this.emit("end", '');
  }
  if (!this._promises) {
    Promise.all(promises).then(onStopped.bind(this), onStopped.bind(this));
  }
};

module.exports = DownloadFile;
