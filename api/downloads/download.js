"use strict";
const _ = require("underscore");
const domain = require('domain');
const DownloadFile = require("./download-file");
const mkdirp = require("mkdirp");

const appSettings = require("../app-settings");
const STATUSES = require("./statuses");


/**
 *
 * @param {object} params - parameters connected with download like id, bandwidth, contentType, remoteUrl, localUrl
 * see util class {@link downloadUtil.getDownloadLinks}
 * @param {object} options - options chosen for whole manifest, like number of chunks, retry,
 * @param {object} cb - callback
 * @constructor
 */
function Download (params, options, cb) {
  this._defaults = {};
  this._defaults.threads = appSettings.getSettings().downloadingThreadsRules.threads;
  this.status = STATUSES.CREATED;
  Object.assign(this, params);
  this._options = Object.assign(this._defaults, options);
  this._options.maxDownloadRetry = appSettings.getSettings().MAX_ERRORS_DOWNLOAD_RETRY;
  this._options.maxDownloadChunkRetry = appSettings.getSettings().MAX_ERRORS_DOWNLOAD_CHUNK_RETRY;
  this._options.maxDownloadChunkInternetRetry = appSettings.getSettings().MAX_INTERNET_ERRORS_DOWNLOAD_CHUNK_RETRY;
  this._options.timeout = appSettings.getSettings().times.DOWNLOAD_TIMEOUT;
  this._options.retryTimeout = appSettings.getSettings().times.RETRY_TIMEOUT;
  this._cb = cb;
  this.stats = {
    available: 0,
    downloaded: 0,
    file_size: 0,
    writeProgress: 0
  };
  _.bindAll(this, "_onError", "_onEnd", "_onData", "_updateStats");
}

/**
 *
 * @param {function} callback - callback to be invoked then local path is created
 * @private
 * @returns {void}
 */
Download.prototype._createLocalPath = function (callback) {
  let folders = this.localUrl.split("/");
  folders = folders.slice(0, folders.length - 1);
  folders = folders.join("/");
  mkdirp(folders, callback);
};

/**
 *
 * @private
 * @returns {void}
 */
Download.prototype._onData = function () {
  this._updateStats();
};

/**
 * @private
 * @returns {void}
 */
Download.prototype._onEnd = function () {
  this.status = STATUSES.FINISHED;
  this._updateStats();
  if (this._cb && this._cb.end) {
    this._cb.end(this);
  }
};

/**
 *
 * @param {object} data - error data
 * @private
 * @returns {void}
 */
Download.prototype._onError = function (data) {
  const self = this;
  this.status = STATUSES.ERROR;
  data = data || {};
  const message = data.message || "";

  self._updateStats();
  if (this._cb && this._cb.error) {
    this._cb.error(self, message);
  }
};

/**
 * @private
 * @returns {void}
 */
Download.prototype._updateStats = function () {
  if (this.status === STATUSES.FINISHED) {
    this.stats.available = this._dl.file_size;
    this.stats.writeProgress = 1;
  } else {
    this.stats.available = this._dl.available;
    this.stats.writeProgress = this._dl.writeProgress;
  }
  this.stats.downloaded = this._dl.downloaded;
  this.stats.file_size = this._dl.file_size;
};

/**
 * @returns {void}
 */
Download.prototype.start = function () {
  const self = this;
  this.status = STATUSES.STARTED;
  this._createLocalPath(function (err) {
    if (err) {
      self._onError(err);
      return;
    }
    const d = domain.create();
    d.on('error', function (err) {
      let message = '';
      if (err) {
        message = err.code;
      }
      // this needs to be disposed otherwise it might complain about unhandled error. magic :)
      d.dispose();
      self._onError({
        message: message
      });
    });
    d.run(function () {
      var cb = {
        error: self._onError,
        end: self._onEnd,
        data: self._onData
      };
      self._dl = new DownloadFile(self.remoteUrl, self.localUrl, self._options, cb);
      self._dl.start();
    });
  });
};

/**
 * @param {function} [resolve] - callback to be invoked when stop was successfully
 * @returns {void}
 */
Download.prototype.stop = function (resolve) {
  const self = this;
  this.status = STATUSES.STOPPED;
  if (typeof resolve !== "function") {
    resolve = function () {
    };
  }
  if (this._dl) {
    const d = domain.create();
    d.on('error', function () {
      resolve();
    });
    self._dl._cb.error = function () {
      resolve();
    };
    self._dl._cb.end = function () {
      resolve();
    };
    d.run(function () {
      self._dl.stop();
    });
  } else {
    resolve();
  }
};

/**
 *
 * @returns {Promise} - promise
 */
Download.prototype.stopPromise = function () {
  const self = this;
  return new Promise(function (resolve) {
    self.stop(function () {
      resolve();
    });
  });
};

module.exports = Download;
