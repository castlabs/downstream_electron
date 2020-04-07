"use strict";
const _ = require("underscore");
const domain = require('domain');
const DownloadFileNoHead = require("./download-file-no-head");
const DownloadFile = require("./download-file");
const mkdirp = require("mkdirp");

const appSettings = require("../app-settings");
const EventEmitter = require("events").EventEmitter;
const STATUSES = require("./statuses");


/**
 *
 * @param {object} params - parameters connected with download like id, bandwidth, contentType, remoteUrl, localUrl
 * see util class {@link downloadUtil.getDownloadLinks}
 * @param {object} options - options chosen for whole manifest, like number of chunks, retry,
 * @constructor
 */
function Download (params, options) {
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
  this._options.useChunkedEncoding = appSettings.getSettings().useChunkedEncoding;
  this._options.useHeadRequests = appSettings.getSettings().useHeadRequests;
  this._options.noCache = appSettings.getSettings().noCache;
  this.stats = {
    available: 0,
    downloaded: 0,
    file_size: 0,
    writeProgress: 0
  };
  _.bindAll(this, "_onError", "_onEnd", "_onData", "_updateStats", "_attachEvents", "_removeEvents",
      "_removeEventsOnStop");

  this.events = new EventEmitter();
}

/**
 * @private
 * @returns {void}
 */
Download.prototype._attachEvents = function () {
  this._dl.on('error', this._onError);
  this._dl.on('end', this._onEnd);
  this._dl.on('data', this._onData);
};

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
  this._removeEvents();
  this.events.emit("end", this);
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

  self._removeEvents();
  self._updateStats();

  // notify only if there exists any error listener (from downloads controller)
  // otherwise EventEmitter throws an error
  if (self.events.listeners('error').length) {
    self.events.emit("error", self, message);
  }
};

Download.prototype._onDomainError = function (data) {
  const self = this;
  data = data || {};
  const message = data.message || "";

  if (self._dl) {
    if (message === 'net::ERR_NETWORK_CHANGED' || message === 'net::ERR_SPDY_PROTOCOL_ERROR' || message === 'net::ERR_HTTP2_PROTOCOL_ERROR') {
      // network changed during download, retry download
      self.stop(() => {
        self.start();
      })
    } else {
      // stop current download to release file stream and notify error
      self.stop(() => {
        self._onError(data);
      })
    }
  } else {
    self._onError(data);
  }
}

/**
 * @private
 * @returns {void}
 */
Download.prototype._removeEvents = function () {
  if (typeof this._dl.removeListener === "function") {
    this._dl.removeListener('error', this._onError);
    this._dl.removeListener('end', this._onEnd);
    this._dl.removeListener('data', this._onData);
  }
};

/**
 * @private
 * @returns {void}
 */
Download.prototype._removeEventsOnStop = function () {
  if (this._dl && typeof this._dl.removeListener === "function") {
    this._dl.removeListener('error', this._onError);
    this._dl.removeListener('end', this._onEnd);
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
    // NOTE: domain module is marked to be deprecated in the future,
    //       we will use it until NodeJS will propose alternative or
    //       rewrite with promises
    const d = domain.create();
    d.on('error', function (err) {
      let message = '';
      if (err) {
        message = err.code || err.message || "";
      }
      // this needs to be disposed otherwise it might complain about unhandled error.
      if (typeof d.dispose === "function") {
        d.dispose();
      }
      self._onDomainError({
        message: message
      });
    });
    d.run(function () {
      self._dl = self.createDownloader(self.remoteUrl, self.localUrl, self._options);
      self._attachEvents();
      self._dl.start();
    });
  });
};

/**
 * Creates file downloader
 * @param {string} [remoteUrl] - url of fragment
 * @param {string} [localUrl] - local url where to download fragment
 * @param {object} [options] - some options
 * @returns {void}
 */
Download.prototype.createDownloader = function (remoteUrl, localUrl, options) {
  if ( this._options.useHeadRequests ) {
    return new DownloadFile(remoteUrl, localUrl, options);
  } else {
    return new DownloadFileNoHead(remoteUrl, localUrl, options);
  }
}

/**
 * @param {function} [resolve] - callback to be invoked when stop was successfully
 * @returns {void}
 */
Download.prototype.stop = function (resolve) {
  const self = this;
  this.status = STATUSES.STOPPED;
  this._removeEventsOnStop();
  if (typeof resolve !== "function") {
    resolve = function () {
    };
  }
  if (this._dl) {
    const d = domain.create();
    d.on('error', function () {
      resolve();
    });
    d.run(function () {
      self._dl.on('error', function () {
        resolve();
      });
      self._dl.on('end', function () {
        resolve();
      });
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
