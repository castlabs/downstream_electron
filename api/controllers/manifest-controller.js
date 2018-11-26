"use strict";

const fs = require("fs");
const path = require("path");
const XMLSerializer = require('xmldom').XMLSerializer;

const appSettings = require("../app-settings");
const parseManifestWithChoosenRepresentations = require("../util/parse-manifest-with-choosen-representations");
const saveFile = require("../util/save-file");
const translation = require('../translation/index');

/**
 *
 * @constructor
 */
function ManifestController () {
  this._manifests = {};
}

/**
 *
 * @param {object} manifest manifest object
 * @returns {void}
 */
ManifestController.prototype.cacheManifest = function (manifest) {
  this._manifests[manifest.id] = manifest;
};

/**
 *
 * @param {Array|number|string} [manifestIds] manifests identifiers
 * @returns {*} manifests
 */
ManifestController.prototype.getManifests = function (manifestIds) {
  let selectedManifests;
  if (typeof manifestIds === "undefined") {
    selectedManifests = this._manifests;
  } else if (typeof manifestIds === "number" || typeof manifestIds === "string") {
    selectedManifests = [this._manifests[String(manifestIds)]];
  } else {
    selectedManifests = [];
    for (let i = 0, j = manifestIds.length; i < j; i++) {
      if (this._manifests[manifestIds[i]]) {
        selectedManifests.push(this._manifests[manifestIds[i]]);
      }
    }
  }
  return selectedManifests;
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {*} manifest
 */
ManifestController.prototype.getManifestById = function (manifestId) {
  if (typeof manifestId === "number" || typeof manifestId === "string") {
    return this._manifests[String(manifestId)];
  }
};

/**
 *
 * @param {Array|number|string} [manifestIds] manifests identifiers
 * @returns {Array} manifests infomrations
 */
ManifestController.prototype.getManifestsInfo = function (manifestIds) {
  let manifests = [];
  const selectedManifests = this.getManifests(manifestIds);
  for (let i = 0, j = selectedManifests.length; i < j; i++) {
    manifests.push(selectedManifests[i].getJsonInfo());
  }
  return manifests;
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {string} local path for manifest files
 */
ManifestController.prototype.getOriginalManifestLocalPath = function (manifestId) {
  return appSettings.getSettings().settingsFolder + manifestId + "/";
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {*} manifest info
 */
ManifestController.prototype.getManifestInfoById = function (manifestId) {
  const manifest = this.getManifestById(manifestId);
  if (manifest) {
    return manifest.getJsonInfo();
  }
};

/**
 *
 * @param {Array|number|string} [manifestIds] manifests identifiers
 * @returns {void}
 */
ManifestController.prototype.removeFromCache = function (manifestIds) {
  if (typeof manifestIds === "number" || typeof manifestIds === "string") {
    manifestIds = [String(manifestIds)];
  }

  manifestIds = manifestIds || [];
  for (let i = 0, j = manifestIds.length; i < j; i++) {
    delete(this._manifests[manifestIds[i]]);
  }
};

ManifestController.prototype.removeFromCacheAll = function () {
  this._manifests = [];
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} promise
 */
ManifestController.prototype.saveOriginalManifestOnceOnly = function (manifestId) {
  const localPath = this.getOriginalManifestLocalPath(manifestId);
  const self = this;
  return new Promise(function (resolve, reject) {
    const manifest = self.getManifestById(manifestId);
    if (!manifest) {
      reject(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
      return;
    }
    fs.exists(path.resolve(localPath + manifest.getManifestName()), function (exists) {
      if (exists) {
        resolve();
      } else {
        const xmlSerializer = new XMLSerializer();
        let manifestString;
        try {
          manifestString = xmlSerializer.serializeToString(manifest.getManifestXML());
        } catch (err) {
          reject(err);
          return;
        }
        saveFile(localPath, manifest.getManifestName(), manifestString, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      }
    });
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {object} representations representations to be saved
 * @param {string} downloadFolder - folder where all fragments are downloaded
 * @returns {Promise} promise
 */
ManifestController.prototype.saveManifestWithChosenRepresentations = function (manifestId, representations, downloadFolder) {
  const localPath = downloadFolder;
  const self = this;
  return new Promise(function (resolve, reject) {
    const manifest = self.getManifestById(manifestId);
    if (!manifest) {
      reject(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
      return;
    }
    let manifestString;
    try {
      manifestString = parseManifestWithChoosenRepresentations(manifest, representations);
    } catch (err) {
      reject(err);
      return;
    }
    saveFile(localPath, manifest.getManifestName(), manifestString, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

module.exports = ManifestController;
