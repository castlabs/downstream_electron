"use strict";
const _ = require("underscore");

/**
 * how much of progress should be connected with writing chunks to a hard drive (1 - 100%)
 * @type {number}
 */
const writeProgressUsage = 0.1;

/**
 *
 * @param {DownloadsStorageController} storage - downloads storage controller
 * @constructor
 */
function DownloadStats (storage) {
  this._storage = storage;
  this._stats = {};
  this._statsPrevious = {};
  this._STATS_TIME_GENERATION = 1000;
  _.bindAll(this, "_generate");
}

/**
 * @param {number} value - bytes
 * @param {number} precision - precision for kilobytes
 * @param {number=} precision2 - precision for megabytes
 * @param {number=} precision3 - precision for gigabytes
 * @returns {string} converted bytes to kb or mb or gb
 * @private
 */
DownloadStats.prototype._convertToBytes = function (value, precision, precision2, precision3) {
  precision2 = typeof precision2 !== "undefined" ? precision2 : precision;
  precision3 = typeof precision3 !== "undefined" ? precision3 : precision;
  if (value < 100000) {
    return this._convertToKB(value, precision)
  } else if (value < 1024 * 1024 * 1024) {
    return this._convertToMB(value, precision2)
  } else {
    return this._convertToGB(value, precision3)
  }
};

/**
 *
 * @param {number} value - bytes
 * @param {number} precision - precision
 * @returns {string} kilobytes
 * @private
 */
DownloadStats.prototype._convertToKB = function (value, precision) {
  precision = typeof precision !== "undefined" ? precision : 0;
  const a = Math.pow(10, precision);
  const oneKB = 1024;
  return (Math.round((value * a) / oneKB) / a) + "kB";
};

/**
 * @param {number} value - bytes
 * @param {number} precision - precision
 * @returns {string} - megabytes
 * @private
 */
DownloadStats.prototype._convertToMB = function (value, precision) {
  precision = typeof precision !== "undefined" ? precision : 0;
  const a = Math.pow(10, precision);
  const oneMB = 1024 * 1024;
  return (Math.round((value * a) / oneMB) / a) + "MB";
};

/**
 * @param {number} value - bytes
 * @param {number} precision - precision
 * @returns {string} gigabytes
 * @private
 */
DownloadStats.prototype._convertToGB = function (value, precision) {
  precision = typeof precision !== "undefined" ? precision : 0;
  const a = Math.pow(10, precision);
  const oneGB = 1024 * 1024 * 1024;
  return (Math.round((value * a) / oneGB) / a) + "GB";
};

DownloadStats.prototype._clearSpeed = function () {
  const allManifestIds = Object.keys(this._stats) || [];
  for (let i = 0, j = allManifestIds.length; i < j; i++) {
    let manifestId = allManifestIds[i];
    if (!this._storage.keyExists(manifestId) && this._stats[manifestId] && this._stats[manifestId].speed)  {
      this._stats[manifestId].speed = 0;
      this._stats[manifestId].speedBytes = this._convertToBytes(this._stats[manifestId].speed, 3, 2);
    }
  }
};

/**
 * @param {boolean} refresh - decides if stats should be only calculated without setting previous stats
 * this is useful when downloads finishes and stats are being calculated one more time
 * @returns {void}
 * @private
 */
DownloadStats.prototype._generate = function (refresh) {
  let allStats = {};

  let manifests = this._storage.getKeys();

  this._clearSpeed();

  function countParts (items) {
    let parts = 0;
    for (let k = 0, l = items.length; k < l; k++) {
      let item = items[k];
      parts += item.bandwidth || 1;
    }
    return parts;
  }

  function countPartsObj (items, withDownloadedOnly) {
    let parts = 0;
    for (let key in items) {
      if (items.hasOwnProperty(key)) {
        let item = items[key];
        parts += (withDownloadedOnly ? (item.stats.available / (item.stats.file_size || 1)) : 1) * (item.bandwidth || 1);
      }
    }
    return parts;
  }

  function toArray (obj) {
    let arr = [];
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        let item = obj[key];
        arr.push(item);
      }
    }
    return arr;
  }

  const stats = {
    downloading: 0,
    downloaded: 0,
    available: 0,
    left: 0,
    downloadingAvailableBytes: 0,
    downloading_file_size: 0,
    downloadingBytes: 0,
    downloadedBytes: 0,
    availableBytes: 0,
    writeProgress: 0,
    writeProgressDownloading: 0,
    writeProgressDownloaded: 0,
    errors: 0,
    progress: 0,
    speed: 0,
    status: ''
  };

  //availableBytes - bates that has been already downloaded
  //downloadedBytes - bytes used to calculate the current speed
  //if for any reason the connection is broken or user stopped, then after resuming the available bytes are
  //always bigger then the actual downloaded bytes.
  //once the file is finished both values are equal and have the same value as file_size

  let now = new Date().getTime();
  if (!this._statsTime) {
    this._statsTime = now;
  }
  for (let i = 0, j = manifests.length; i < j; i++) {
    let manifestId = manifests[i];
    allStats[manifestId] = _.clone(stats);
    allStats[manifestId].left = this._storage.left.count(manifestId);
    allStats[manifestId].leftI = this._storage.left.getItems(manifestId);

    allStats[manifestId].errors = this._storage.errors.count(manifestId);
    allStats[manifestId].errorsI = this._storage.errors.getItems(manifestId);
    let items = this._storage.downloading.getKeys(manifestId);
    allStats[manifestId].downloading = items.length;
    allStats[manifestId].downloadingI = this._storage.downloading.getItems(manifestId);
    let writeProgressDownloadingItemsLength = items.length;
    for (let k = 0, l = items.length; k < l; k++) {
      let item = this._storage.downloading.getItem(manifestId, items[k]);
      allStats[manifestId].downloadingBytes += item.stats.downloaded;
      allStats[manifestId].downloading_file_size += item.stats.file_size;
      allStats[manifestId].downloadingAvailableBytes += item.stats.available;
      allStats[manifestId].writeProgressDownloading += item.stats.writeProgress;
    }
    items = this._storage.downloaded.getItems(manifestId);
    allStats[manifestId].downloaded = items.length;
    allStats[manifestId].downloadedI = items;
    let writeProgressItemsDownloadedLength = items.length;
    for (let k = 0, l = items.length; k < l; k++) {
      let item = items[k];
      allStats[manifestId].downloadedBytes += item.stats.downloaded;
      allStats[manifestId].writeProgressDownloaded += item.stats.writeProgress;
    }

    //need to calculate what percentage of bytes that are going to be written to hard drive are according the the whole
    // size for example 5 files are being downloaded, 4 smaller are 100mb and one large 1,9GB. When the large file is
    // being saved the write progress is basically 1900/2000 = 95% of all written bytes.
    allStats[manifestId].writeProgressDownloading = allStats[manifestId].writeProgressDownloading *
      (allStats[manifestId].downloadingAvailableBytes / (allStats[manifestId].downloadedBytes + allStats[manifestId].downloading_file_size) || 1);
    allStats[manifestId].writeProgressDownloading = allStats[manifestId].writeProgressDownloading / (writeProgressDownloadingItemsLength || 1);

    allStats[manifestId].writeProgressDownloaded = allStats[manifestId].writeProgressDownloaded *
      (allStats[manifestId].downloadedBytes / (allStats[manifestId].downloadedBytes + allStats[manifestId].downloading_file_size) || 1);
    allStats[manifestId].writeProgressDownloaded = allStats[manifestId].writeProgressDownloaded / (writeProgressItemsDownloadedLength || 1);

    allStats[manifestId].writeProgress = allStats[manifestId].writeProgressDownloading + allStats[manifestId].writeProgressDownloaded;

    let speed = this._getDiff("downloadingBytes", manifestId, allStats, this._statsPrevious);
    speed += this._getDiff("downloadedBytes", manifestId, allStats, this._statsPrevious);
    speed = (speed * 1000) / ((now - this._statsTime) || 1  );
    allStats[manifestId].speed = speed;
    allStats[manifestId].status = this._storage.status.getItem(manifestId, "status");
    allStats[manifestId].details = this._storage.status.getItem(manifestId, "details");
    //progress for downloaded
    let leftParts = countParts(allStats[manifestId].leftI);
    let downloadedParts = countParts(allStats[manifestId].downloadedI);
    let downloadingPartsSize = countPartsObj(allStats[manifestId].downloadingI);
    let downloadingParts = countPartsObj(allStats[manifestId].downloadingI, true);
    let errorParts = countPartsObj(allStats[manifestId].errorsI);
    let allParts = leftParts + downloadedParts + downloadingPartsSize + errorParts;

    allStats[manifestId].progress = (downloadedParts + downloadingParts) / (allParts || 1);
    allStats[manifestId].progress = allStats[manifestId].progress * (1 - writeProgressUsage);
    allStats[manifestId].progress += allStats[manifestId].writeProgress * writeProgressUsage;

    allStats[manifestId].downloadedBytesTotal = Math.round(allStats[manifestId].progress * 10000) / 100;
    allStats[manifestId].downloadedBytesTotal += "%";

    // progress of each represention
    let reduceFunc = function (map, obj) {
      if ( !map[obj.id] )  {
        map[obj.id] = []
      }
      map[obj.id].push(obj);
      return map;
    }
    let downloadedById = allStats[manifestId].downloadedI.reduce(reduceFunc, {});
    let downloadingArray = toArray(allStats[manifestId].downloadingI);
    let downloadingById = downloadingArray.reduce(reduceFunc, {});
    let leftById = allStats[manifestId].leftI.reduce(reduceFunc, {});
    let errorArray = toArray(allStats[manifestId].errorsI);
    let errorsById = errorArray.reduce(reduceFunc, {});

    let extend = function (obj, src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          if (!obj[key]) {
            obj[key] = [];
          }
          obj[key] = obj[key].concat(src[key]);
        }
      }
      return obj;
    }
    let allPartsById = {};
    extend(allPartsById, downloadedById);
    extend(allPartsById, downloadingById);
    extend(allPartsById, leftById);
    extend(allPartsById, errorsById);

    // compute progres for each id
    let progressById = {};
    let key;
    for (key in allPartsById) {
      if (allPartsById.hasOwnProperty(key)) {
        progressById[key] = (countPartsObj(downloadedById[key])) / (countPartsObj(allPartsById[key]) || 1);
      }
    }
    let progressByIdPercent = {};
    for (key in progressById) {
      if (progressById.hasOwnProperty(key)) {
        progressByIdPercent[key] = Math.round(progressById[key] * 10000) / 100 + "%";
      }
    }
    allStats[manifestId].progressById = progressById;
    allStats[manifestId].progressByIdPercent = progressByIdPercent;
  }
  let showStats = {};
  for (let i = 0, j = manifests.length; i < j; i++) {
    let manifestId = manifests[i];
    showStats[manifestId] = {};
    let downloadedBytesTotal = allStats[manifestId].downloadedBytes + allStats[manifestId].downloadingAvailableBytes;
    showStats[manifestId].progress = allStats[manifestId].progress;
    showStats[manifestId].progressPercentage = allStats[manifestId].downloadedBytesTotal;
    showStats[manifestId].progressById = allStats[manifestId].progressById;
    showStats[manifestId].progressByIdPercent = allStats[manifestId].progressByIdPercent;
    showStats[manifestId].downloadedBytesTotal = this._convertToBytes(downloadedBytesTotal, 1, 2, 2);
    showStats[manifestId].downloaded = allStats[manifestId].downloaded;
    showStats[manifestId].left = allStats[manifestId].left;
    showStats[manifestId].errors = allStats[manifestId].errors;
    if (allStats[manifestId].speed < 0) {
      allStats[manifestId].speed = 0;
    }
    showStats[manifestId].speed = allStats[manifestId].speed;
    showStats[manifestId].speedBytes = this._convertToBytes(allStats[manifestId].speed, 3, 2);
    showStats[manifestId].status = allStats[manifestId].status;
    showStats[manifestId].details = allStats[manifestId].details;
  }
  for (let key in showStats) {
    if (showStats.hasOwnProperty(key)) {
      this._stats[key] = showStats[key];
    }
  }
  if (!refresh) {
    this._statsTime = now;
    for (let key in allStats) {
      if (allStats.hasOwnProperty(key)) {
        this._statsPrevious[key] = allStats[key];
      }
    }
  }
};

/**
 * @param {string} key - key stats identifier
 * @param {string} manifestId - manifest identifier
 * @param {number} current - current value
 * @param {number} previous - previous value
 * @returns {number} - difference between current and previous value
 * @private
 */
DownloadStats.prototype._getDiff = function (key, manifestId, current, previous) {
  const currentValue = current[manifestId] && current[manifestId][key] || 0;
  const previousValue = previous[manifestId] && previous[manifestId][key] || 0;
  return currentValue - previousValue;
};

/**
 *
 * @param {string|array} manifestIds - manifest identifier or array of manifests identifier
 * @returns {*} stats for certain download or array of stats for downloads
 */
DownloadStats.prototype.getStats = function (manifestIds) {
  let stats;
  if (this._stats) {
    if (typeof manifestIds === 'string') {
      stats = this._stats[manifestIds];
    } else {
      stats = [];
      for (let i = 0, j = manifestIds.length; i < j; i++) {
        let stat = this._stats[manifestIds[i]];
        if (stat) {
          stats.push(stat);
        }
      }
    }
  }
  return stats;
};

DownloadStats.prototype.refresh = function () {
  this._generate(true);
};

DownloadStats.prototype.start = function () {
  if (!this._interval) {
    this._interval = setInterval(this._generate, this._STATS_TIME_GENERATION);
    this._generate();
  }
};

DownloadStats.prototype.stop = function () {
  clearInterval(this._interval);
  this._interval = null;
  this._generate();
  this._statsPrevious = {};
};

module.exports = DownloadStats;
