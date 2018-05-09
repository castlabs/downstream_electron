"use strict";
const path = require("path");
const rmdir = require("../util/remove-dir");

const appSettings = require("../app-settings");
const ReadItem = require("../downloads/read-item");
const dirList = require("../util/dir-list");
const Manifest = require("../manifest/loader/manifest").Manifest;
const STATUSES = require("../downloads/statuses");

/**
 *
 * @param {ManifestController} manifestController - reference to existing manifest controller
 * @constructor
 */
function OfflineController (manifestController) {
  this._manifestController = manifestController;
}

/**
 *
 * @param {Function} callback - function to be called when list is ready
 * @returns {void}
 */
OfflineController.prototype.getManifestsList = function (callback) {
  Promise.all([
    dirList(appSettings.getSettings().settingsFolder, true, false),
    dirList(appSettings.getSettings().downloadsFolderPath, true, false)
  ]).then(function (results) {
    let manifestList = [];
    const settingsFolderList = results[0];
    const downloadsFolderList = results[1];
    let downloadsFolderListObj = {};
    for (let i = 0, j = downloadsFolderList.length; i < j; i++) {
      downloadsFolderListObj[downloadsFolderList[i]] = true;
    }
    for (let i = 0, j = settingsFolderList.length; i < j; i++) {
      // if (downloadsFolderListObj[settingsFolderList[i]]) {
      manifestList.push(settingsFolderList[i]);
      // }
    }
    callback(null, manifestList);
  }, function (err) {
    callback(err)
  });
};

/**
 *
 * @param {Function} callback - function to be called when list with info is ready
 * @returns {void}
 */
OfflineController.prototype.getManifestsListWithInfo = function (callback) {
  const self = this;
  this.getManifestsList(function (err, list) {
    if (err) {
      callback(err);
    } else {
      let infoP = [];
      for (let i = 0, j = list.length; i < j; i++) {
        infoP.push(self.getManifestInfoPromise(list[i]))
      }
      Promise.all(infoP).then(function (results) {
        let newResults = [];
        for (let i = 0, j = results.length; i < j; i++) {
          if (results[i]) {
            newResults.push(results[i]);
          }
        }
        callback(null, newResults);
      }, function (err) {
        callback(err);
      });
    }
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Function} callback - function to be called when info for manifest is ready
 * @param {Boolean} full - if downloaded info should contain all items or only the length
 * @returns {void}
 */
OfflineController.prototype.getManifestInfo = function (manifestId, callback, full) {
  const self = this;

  function addManifestInfoAndContinue (info) {
    const manifestName = info.manifest.name;
    const manifestUrl = info.manifest.url;
    const manifestLocalUrl = path.resolve(appSettings.getSettings().settingsFolder + "/" + manifestId + "/" + manifestName);

    let manifest = self._manifestController.getManifestById(manifestId);
    if (manifest) {
      info.manifestInfo = manifest.getJsonInfo();
      callback(null, info);
    } else {
      manifest = new Manifest(manifestId);
      manifest.loadFromLocal(manifestLocalUrl, manifestUrl).then(function () {
        self._manifestController.cacheManifest(manifest);
        info.manifestInfo = manifest.getJsonInfo();
        callback(null, info);
      }, function (err) {
        if (err && err.code === "ENOENT") {
          callback();
        } else {
          callback(err);
        }
      });
    }
  }

  Promise.all([
    new ReadItem(manifestId, appSettings.getSettings().stores.MANIFEST),
    new ReadItem(manifestId, appSettings.getSettings().stores.DOWNLOADS.DOWNLOADED),
    new ReadItem(manifestId, appSettings.getSettings().stores.STATUS),
    new ReadItem(manifestId, appSettings.getSettings().stores.PERSISTENT),
    new ReadItem(manifestId, appSettings.getSettings().stores.DATA),
  ]).then(function (results) {
    let info = {};
    const manifestSettings = results[0] || {};

    const downloaded = results[1] || [];
    const status = results[2] || {};
    const persistent = results[3] || '';
    const data = results[4] || '';

    info.status = status.status || STATUSES.BROKEN;
    if (!self.downloadStorage.keyExists(manifestId) && info.status === STATUSES.STARTED) {
      info.status = STATUSES.BROKEN;
    }
    info.manifest = manifestSettings;
    info.left = status.left || 0;
    info.persistent = persistent;
    info.downloaded = full ? downloaded : downloaded.length;
    info.data = data;

    addManifestInfoAndContinue(info);
  }, callback);
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Boolean} full - if downloaded info should contain all items or only the length
 * @returns {Promise} - promise
 */
OfflineController.prototype.getManifestInfoPromise = function (manifestId, full) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self.getManifestInfo(manifestId, function (err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result);
      }
    }, full)
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Function} callback - callback with resolved info data about manifest - if such exists
 * @returns {void}
 */
OfflineController.prototype.getManifestDataFile = function (manifestId, callback) {
  new ReadItem(manifestId, appSettings.getSettings().stores.MANIFEST).then(function (data) {
    callback(data);
  }, function () {
    callback();
  })
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Function} onSuccess - callback to be invoked when remove has been successfully
 * @param {Function} onFailure - callback to be invoked when remove failed
 * @returns {void}
 */
OfflineController.prototype.remove = function (manifestId, onSuccess, onFailure) {
  const settingsFolder = appSettings.getSettings().settingsFolder + manifestId;
  const downloadsFolder = appSettings.getSettings().downloadsFolderPath + manifestId;

  rmdir(downloadsFolder, function (err) {
    if (err && err.code !== "ENOENT") {
      onFailure(err);
    } else {
      rmdir(settingsFolder, function (err) {
        if (err && err.code !== "ENOENT") {
          onFailure(err);
        } else {
          onSuccess();
        }
      })
    }
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} - promise
 */
OfflineController.prototype.removePromise = function (manifestId) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self.remove(manifestId, resolve, reject);
  });
};

/**
 *
 * @returns {Promise} - promise
 */
OfflineController.prototype.removeAllPromise = function () {
  return new Promise(function (resolve, reject) {
    const settingsFolder = appSettings.getSettings().settingsFolder;
    const downloadsFolder = appSettings.getSettings().downloadsFolderPath;
    rmdir(downloadsFolder, function (err) {
      if (err && err.code !== "ENOENT") {
        reject(err);
      } else {
        rmdir(settingsFolder, function (err) {
          if (err && err.code !== "ENOENT") {
            reject(err);
          } else {
            resolve();
          }
        })
      }
    });
  });
};
/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Function} onSuccess - callback to be invoked when restore has been successfully
 * @param {Function} onFailure - callback to be invoked when restore failed
 * @returns {void}
 */
OfflineController.prototype.restoreLocalManifest = function (manifestId, onSuccess, onFailure) {
  const self = this;
  this.getManifestInfo(manifestId, function (err, info) {
    let representations = {};
    representations.video = info.manifest.video;
    representations.audio = info.manifest.audio;
    representations.text = info.manifest.text;
    self._manifestController.saveManifestWithChosenRepresentations(manifestId, representations)
        .then(onSuccess, onFailure);
  });
};

/**
 *
 * @param {DownloadsStorageController} storage - downloads storage controller
 * @returns {void}
 */
OfflineController.prototype.setDownloadStorage = function (storage) {
  this.downloadStorage = storage;
};

module.exports = OfflineController;
