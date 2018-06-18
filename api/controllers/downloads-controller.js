/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
"use strict";
const _ = require("underscore");
const mkdirpPromise = require("../util/mkdirp-promise");

const appSettings = require("../app-settings");
const translation = require("../translation/index");
const Download = require("../downloads/download");
const DownloadsStorageController = require("./downloads-storage-controller");
const downloadUtil = require("../util/downloads");
const DownloadStats = require("../stats/download_stats");
const STATUSES = require("../downloads/statuses");
const CODES = require("../downloads/codes");
const constants = require("../constants");
const utilUrl = require("../util/url");

/**
 *
 * @param {ManifestController} manifestController - existing manifest controller
 * @param {OfflineController} offlineController - existing offline controller
 * @constructor
 */
function DownloadsController (manifestController, offlineController) {
  this._manifestsDownloadOrder = [];
  this._manifestsDownloadOrderObj = {};
  this._manifestController = manifestController;
  this._offlineController = offlineController;
  this.storage = new DownloadsStorageController();
  this._offlineController.setDownloadStorage(this.storage);
  this._names = {
    downloadInProgress: "downloadInProgress",
    options: "options",
    maxDownloadInProgress: "maxDownloadInProgress"
  };
  this._STATS_TIME_GENERATION = 1000;
  this.downloadStats = new DownloadStats(this.storage);
  _.bindAll(this, "_onDownloadEnd", "_onDownloadError", "isDownloadFinished");
}

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Array} videoLinks - video links to be downloaded
 * @param {Array} audioLinks - audio links to be downloaded
 * @param {Array} textLinks - text links to be downloaded
 * @returns {void}
 * @private
 */
DownloadsController.prototype._addDownloads = function (manifestId, videoLinks, audioLinks, textLinks) {
  let working = true;
  this._prepareStartOptions(manifestId, videoLinks, audioLinks, textLinks);
  while (working) {
    let ratioAudioVideo = videoLinks.length ? Math.round(audioLinks.length / videoLinks.length) : 1;
    let ratioTextVideo = videoLinks.length ? Math.round(textLinks.length / videoLinks.length) : 1;
    this._addNextItemToQueue(manifestId, textLinks, ratioTextVideo);
    this._addNextItemToQueue(manifestId, audioLinks, ratioAudioVideo);
    this._addNextItemToQueue(manifestId, videoLinks);
    working = !!(textLinks.length || videoLinks.length || audioLinks.length);
  }
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Array} links - array of links to be downloaded
 * @param {number} nbItems - the rnumber of items to add to the queue
 * @private
 * @returns {void}
 */
DownloadsController.prototype._addNextItemToQueue = function (manifestId, links, nbItems) {
  let link;
  if (!nbItems) {
    nbItems = 1;
  }
  if (links.length) {
    while (nbItems > 0) {
      link = links.shift();
      link.manifestId = manifestId;
      this.storage.left.push(manifestId, link);
      nbItems--;
    }
  }
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {boolean} asFirst - to force to download manifest without wiating in queue
 * @returns {boolean} - status if operation was successfully
 * @private
 */
DownloadsController.prototype._downloadOrderAddManifest = function (manifestId, asFirst) {
  if (!this._downloadOrderManifestExists(manifestId)) {
    this._manifestsDownloadOrderObj[manifestId] = true;
    if (asFirst) {
      this._manifestsDownloadOrder.unshift(manifestId);
    } else {
      this._manifestsDownloadOrder.push(manifestId);
    }
    return true;
  } else {
    return false;
  }
};

/**
 *
 * @param {number} nextManifestPositionInArray - index number from array _manifestsDownloadOrder
 * @returns {manifestId} - manifest identifier
 * @private
 */
DownloadsController.prototype._downloadOrderGetManifestId = function (nextManifestPositionInArray) {
  return this._manifestsDownloadOrder[nextManifestPositionInArray];
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {*} - if manifest has been already added to the queue
 * @private
 */
DownloadsController.prototype._downloadOrderManifestExists = function (manifestId) {
  return this._manifestsDownloadOrderObj[manifestId];
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {boolean} - status if manifest has been removed from queue
 * @private
 */
DownloadsController.prototype._downloadOrderRemoveManifest = function (manifestId) {
  let found = false, i, j;
  delete this._manifestsDownloadOrderObj[manifestId];
  for (i = 0, j = this._manifestsDownloadOrder.length; i < j; i++) {
    if (this._manifestsDownloadOrder[i] === manifestId) {
      this._manifestsDownloadOrder.splice(i, 1);
      found = true;
      break;
    }
  }
  return found;
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {function} onSuccess - callback to be invoked when download finishes with success
 * @param {function} onFailure - callback to be invoked when download failed
 * @private
 * @returns {void}
 */
DownloadsController.prototype._finish = function (manifestId, onSuccess, onFailure) {
  this.downloadStats.refresh();
  this._downloadOrderRemoveManifest(manifestId);
  if (!this._manifestsDownloadOrder.length) {
    this.downloadStats.stop();
  }
  this.storage.removeItem(manifestId)
      .then(onSuccess, onFailure);
};

/**
 *
 * @param {object} link - link object which consist remote and local url
 * @private
 * @returns {string} - unique hash for download file based on local and remote url
 */
DownloadsController.prototype._getDownloadHash = function (link) {
  return link.remoteUrl + "-" + link.localUrl;
};

/**
 *
 * @param {Download} download - download class to be marked either with success or with error
 * @private
 * @returns {void}
 */
DownloadsController.prototype._markDownloadItem = function (download) {
  const self = this;
  const manifestId = download.manifestId;
  const downloadHash = self._getDownloadHash(download);
  let syncStorageKeys = [];
  let lastItem;

  download.events.removeListener("end", self._onDownloadEnd);
  download.events.removeListener("error", self._onDownloadError);

  //refreshing stats for last time - to have correct stats for subscribers progress before it is removed
  if (self.storage.downloading.count(manifestId) === 1 && self.storage.left.count(manifestId) === 0) {
    this.downloadStats.refresh();
    lastItem = true;
  }

  if (download.status === STATUSES.FINISHED) {
    self.storage.downloaded.push(manifestId, download);
    syncStorageKeys.push(this.storage.stores.DOWNLOADS.DOWNLOADED);
  } else {
    self.storage.errors.push(manifestId, download);
  }
  self.storage.downloading.removeItem(manifestId, downloadHash);

  if (self.isDownloadFinished(manifestId)) {
    if (self.storage.errors.count(manifestId) === 0) {
      self.storage.status.setItem(manifestId, "status", STATUSES.FINISHED);
    } else {
      self.storage.status.setItem(manifestId, "status", STATUSES.ERROR);
    }
    syncStorageKeys.push(this.storage.stores.STATUS);
  }

  self.storage.sync(manifestId, syncStorageKeys)
      .then(function () {
        self.storage.params.decrease(manifestId, self._names.downloadInProgress);
        if (lastItem) {
          self._finish(manifestId, function () {
            self.startQueue();
            console.info("FINISHED", manifestId);
          }, function () {
            self.startQueue();
          });
        } else {
          self.startQueue();
        }
      }, function (err) {
        console.error("ERROR", err);
      });
};

/**
 *
 * @param {Download} download - Download Class
 * @param {object} err - error object
 * @returns {void}
 * @private
 */
DownloadsController.prototype._onDownloadError = function (download, err) {
  console.error("ERROR", download.remoteUrl, err);
  this._markDownloadItem(download);
};

/**
 *
 * @param {Download} download - Download Class
 * @returns {void}
 * @private
 */
DownloadsController.prototype._onDownloadEnd = function (download) {
  // console.log("FINISHED", download.remoteUrl, download.localUrl);
  this._markDownloadItem(download);
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Array} videoLinks - video links to be downloaded
 * @param {Array} audioLinks - audio links to be downloaded
 * @param {Array} textLinks - text links to be downloaded
 * @returns {void}
 * @private
 */
DownloadsController.prototype._prepareStartOptions = function (manifestId, videoLinks, audioLinks, textLinks) {
  const count = videoLinks.length + audioLinks.length + textLinks.length;
  console.info("ADDING ->>> ", manifestId + ",", count, "fragments");
  let options = {};
  this.storage.params.setItem(manifestId, this._names.downloadInProgress, 0);
  let maxDownloadInProgress;
  const threadRules = appSettings.getSettings().downloadingThreadsRules;

  for (let i = 0, j = threadRules.items.length; i < j; i++) {
    if (count <= threadRules.items[i].max) {
      options[threadRules.threadName] = threadRules.items[i].threads;
      maxDownloadInProgress = threadRules.items[i].files;
      break;
    }
  }

  this.storage.params.setItem(manifestId, this._names.options, options);
  this.storage.params.setItem(manifestId, this._names.maxDownloadInProgress, maxDownloadInProgress);

  //download order can help to stop download one manifest and download another or download them in parallel
  this._downloadOrderAddManifest(manifestId);
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {boolean} - if download is finished
 */
DownloadsController.prototype.isDownloadFinished = function (manifestId) {
  return !this.storage.left.count(manifestId) && !this.storage.downloading.count(manifestId);
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {boolean} - if download is finished and synced (info written on disk)
 */
DownloadsController.prototype.isDownloadFinishedAndSynced = function (manifestId) {
  return !this.storage.left.count(manifestId) && !this.storage.downloading.count(manifestId) && !this.storage.keyExists(manifestId);
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {object} representations - object containing video, audio and text representations ids
 * @param {function} onSuccess - callback to be invoked when start has been successfully
 * @param {function} onFailure - callback to be invoked when start failed
 * @param {boolean} fromResumed - if start has been called from resume api method
 * @returns {void}
 */
DownloadsController.prototype.start = function (manifestId, representations, onSuccess, onFailure, fromResumed) {
  const self = this;
  this.downloadStats.start();
  const manifest = this._manifestController.getManifestById(manifestId);
  if (!manifest) {
    onFailure(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
    return;
  }
  representations = representations || {};
  let video = representations.video || [];
  let audio = representations.audio || [];
  let text = representations.text || [];
  const videoR = manifest.getVideoRepresentations();
  const audioR = manifest.getAudioRepresentations();
  const textR = manifest.getTextRepresentations();

  const localPath = appSettings.getSettings().downloadsFolderPath + manifestId + "/";
  const manifestUrl = manifest.getManifestUrl();
  const manifestName = manifest.getManifestName();

  function getManifestBaseUrl (xml, manifestUrlDomain) {
    let manifestBaseUrl;
    const MPD = xml.getElementsByTagName("MPD")[0];
    if (MPD) {
      for (let i = 0, j = MPD.childNodes.length; i < j; i++) {
        if (MPD.childNodes[i].nodeName === "BaseURL") {
          manifestBaseUrl = MPD.childNodes[i].textContent;
          if (!manifestBaseUrl.match(constants.regexpProtocolRemove)) {
            manifestBaseUrl = utilUrl.joinPath(manifestUrlDomain, manifestBaseUrl);
          }
          break;
        }
      }
    }
    if (!manifestBaseUrl) {
      manifestBaseUrl = manifestUrlDomain;
    }
    return manifestBaseUrl;
  }

  Promise.all([
        this._offlineController.getManifestInfoPromise(manifestId, true),
        this.storage.getItem(manifestId),
        mkdirpPromise(localPath),
      ])
      .then(function (results) {
        const info = results[0];
        const storageItem = results[1];
        if (storageItem && !self.isDownloadFinished(manifestId)) {
          if (fromResumed) {
            onFailure(translation.getError(translation.e.downloads.ALREADY_RESUMED, manifestId));
          } else {
            onFailure(translation.getError(translation.e.downloads.ALREADY_STARTED, manifestId));
          }
          return;
        }

        //collect Links - start
        if (info.manifest.video) {
          video = _.union(video, info.manifest.video);
        }
        if (info.manifest.audio) {
          audio = _.union(audio, info.manifest.audio);
        }
        if (info.manifest.text) {
          text = _.union(text, info.manifest.text);
        }
        const downloaded = info.downloaded || [];
        let downloadedHash = {};
        for (let i = 0, j = downloaded.length; i < j; i++) {
          downloadedHash[downloaded[i].localUrl] = downloaded[i];
        }

        let remotePath = getManifestBaseUrl(manifest.manifestXML.xml, manifest.url_domain);
        const videoLinks = downloadUtil.getDownloadLinks(manifestId, localPath, remotePath, video, videoR, downloadedHash);
        const audioLinks = downloadUtil.getDownloadLinks(manifestId, localPath, remotePath, audio, audioR, downloadedHash);
        const textLinks = downloadUtil.getDownloadLinks(manifestId, localPath, remotePath, text, textR, downloadedHash);

        //collect Links - end

        self.storage.createIfNotExists(manifestId)
            .then(function () {

              self.storage.manifest.setItem(manifestId, "ts", new Date().getTime());
              self.storage.manifest.setItem(manifestId, "url", manifestUrl);
              self.storage.manifest.setItem(manifestId, "name", manifestName);
              self.storage.manifest.setItem(manifestId, "video", video);
              self.storage.manifest.setItem(manifestId, "audio", audio);
              self.storage.manifest.setItem(manifestId, "text", text);

              self.storage.downloaded.clear(manifestId);
              self.storage.downloaded.concat(manifestId, downloaded);
              self.storage.errors.clear(manifestId);

              self.storage.status.setItem(manifestId, "status", STATUSES.CREATED);

              Promise.all([
                    self.storage.sync(manifestId, [
                      self.storage.stores.MANIFEST,
                      self.storage.stores.STATUS
                    ]),
                    self._manifestController.saveOriginalManifestOnceOnly(manifestId),
                    self._manifestController.saveManifestWithChosenRepresentations(manifestId, {
                      video: video,
                      audio: audio,
                      text: text,
                    })
                  ])
                  .then(function () {
                    self._addDownloads(manifestId, videoLinks, audioLinks, textLinks);
                    self.storage.status.setItem(manifestId, "status", STATUSES.STARTED);
                    self.storage.status.setItem(manifestId, "left", self.storage.left.count(manifestId));
                    self.storage.sync(manifestId, [
                          self.storage.stores.DOWNLOADS.DOWNLOADED,
                          self.storage.stores.STATUS
                        ])
                        .then(function () {
                          self.downloadStats.refresh();
                          if (self.isDownloadFinished(manifestId)) {
                            self.storage.status.setItem(manifestId, "status", STATUSES.FINISHED);
                            self.storage.sync(manifestId, self.storage.stores.STATUS)
                                .then(function () {
                                  self._finish(manifestId, onSuccess, onFailure);
                                }, onFailure);
                          } else {
                            self.downloadStats.start();
                            self.startQueue();
                            onSuccess();
                          }
                        }, onFailure);
                  }, onFailure);
            }, onFailure);
      });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {function} onSuccess - callback to be invoked when stop has been successfully
 * @param {function} onFailure - callback to be invoked when stop failed
 * @returns {void}
 */
DownloadsController.prototype.stop = function (manifestId, onSuccess, onFailure) {
  const self = this;
  self._downloadOrderRemoveManifest(manifestId);
  self.storage.getItem(manifestId)
      .then(function (result) {
        if (!result) {
          onFailure(translation.getError(translation.e.downloads.ALREADY_STOPPED, manifestId));
          return;
        }
        const itemsToStop = self.storage.downloading.getKeys(manifestId);
        let itemToStop;
        console.info("STOPPING", manifestId, itemsToStop.length);
        let promises = [];
        for (let i = 0, j = itemsToStop.length; i < j; i++) {
          itemToStop = self.storage.downloading.getItem(manifestId, itemsToStop[i]);
          itemToStop.events.removeListener("end", self._onDownloadEnd);
          itemToStop.events.removeListener("error", self._onDownloadError);
          promises.push(itemToStop.stopPromise());
        }

        self.storage.status.setItem(manifestId, "status", STATUSES.STOPPED);

        promises.push(self.storage.sync(manifestId, [
          self.storage.stores.DOWNLOADS.DOWNLOADED,
          self.storage.stores.STATUS,
        ]));
        Promise.all(promises)
            .then(function () {
              self._finish(manifestId, onSuccess, onFailure);
            }, function (err) {
              onFailure(translation.getError(translation.e.downloads.STOPPING_FAILED, manifestId), err);
            });
      }, function (err) {
        onFailure(translation.getError(translation.e.downloads.STOPPING_FAILED, manifestId), err);
      });

};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {boolean} ignoreStopped - don't fail if download has been already stopped
 * @returns {Promise} - promise
 */
DownloadsController.prototype.stopPromise = function (manifestId, ignoreStopped) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self.stop(manifestId, resolve, function (err) {
      if (err) {
        if (ignoreStopped && err.code === CODES.ERRORS.STOPPED) {
          resolve();
          return;
        }
        reject(err);
      } else {
        resolve()
      }
    });
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} - promise
 */
DownloadsController.prototype.removePromise = function (manifestId) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self.stopPromise(manifestId)
        .then(function () {
          self.storage.removeItem(manifestId)
              .then(resolve, reject);
        }, function (err) {
          //already stopped, continue
          if (err && err.code === CODES.ERRORS.STOPPED) {
            self.storage.removeItem(manifestId)
                .then(resolve, reject);
          } else {
            reject(err);
          }
        });
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {object} link - object link to be downloaded
 * @private
 * @returns {void}
 */
DownloadsController.prototype._addLinkToDownload = function (manifestId, link) {
  const self = this;
  const params = Object.assign({}, link);
  const download = new Download(params, self.storage.params.getItem(manifestId, self._names.options));
  const downloadHash = self._getDownloadHash(link);
  self.storage.downloading.setItem(manifestId, downloadHash, download);
  self.storage.status.setItem(manifestId, "left", self.storage.left.count(manifestId) + self.storage.errors.count(manifestId));
  self.storage.sync(manifestId, self.storage.stores.STATUS);
  download.events.on("end", self._onDownloadEnd);
  download.events.on("error", self._onDownloadError);
  download.start();
};

/**
 *
 * @param {number} [nextManifestPositionInArray] - index from array to decide which manifest should be downloaded next
 *   (queue)
 * @returns {void}
 */
DownloadsController.prototype.startQueue = function (nextManifestPositionInArray) {
  let count, downloadsInProgress, link, manifestId, maxDownloads;
  if (typeof nextManifestPositionInArray === "undefined") {
    nextManifestPositionInArray = 0;
  }

  if (nextManifestPositionInArray >= appSettings.getSettings().numberOfManifestsInParallel) {
    return;
  }
  manifestId = this._downloadOrderGetManifestId(nextManifestPositionInArray);
  if (!manifestId) {
    count = 0;
    let i, j, items;
    items = this.storage.getKeys();
    for (i = 0, j = items.length; i < j; i++) {
      count += this.storage.params.count(items[i], this._names.downloadInProgress);
    }
    if (count === 0) {
      this.downloadStats.stop();
    }
    return;
  }
  downloadsInProgress = this.storage.params.getItem(manifestId, this._names.downloadInProgress);
  maxDownloads = this.storage.params.getItem(manifestId, this._names.maxDownloadInProgress);
  if (downloadsInProgress < maxDownloads - 1) {
    link = this.storage.left.shift(manifestId);
    if (link) {
      this.storage.params.increase(manifestId, this._names.downloadInProgress);
      this._addLinkToDownload(manifestId, link);
    } else {
      //check next manifest
      nextManifestPositionInArray++;
    }
    this.startQueue(nextManifestPositionInArray);
  } else if (appSettings.getSettings().numberOfManifestsInParallel > 1 && nextManifestPositionInArray < appSettings.getSettings().numberOfManifestsInParallel) {
    nextManifestPositionInArray++;
    this.startQueue(nextManifestPositionInArray);
  }
};

module.exports = DownloadsController;
