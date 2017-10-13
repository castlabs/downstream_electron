"use strict";
const mkdirp = require('mkdirp');

const appSettings = require('../app-settings');
const jsonfile = require('jsonfile');
const LinkSave = require('../manifest/json/link-save');

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {string} storageKey - storage key
 * @param {object} items - storage items
 * @constructor
 */
function FlushItem (manifestId, storageKey, items) {
  this.manifestId = manifestId;
  this.storageKey = storageKey;
  this.items = items;
}

/**
 *
 * @param {function} resolve - callback to be invoked when save was successful
 * @param {function} reject - callback to be invoked when save failed
 * @private
 * @returns {void}
 */
FlushItem.prototype._saveToDisk = function (resolve, reject) {
  const self = this;
  const path = appSettings.getSettings().settingsFolder + this.manifestId + "/";
  const file = "" + this.storageKey + ".json";
  const fileUrl = path + file;
  mkdirp(path, function (err) {
    if (err) {
      reject(err);
    } else {
      let data = convertStorage(self.storageKey, self.items);
      jsonfile.writeFile(fileUrl, data, function (err) {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    }
  });
};

/**
 *
 * @returns {Promise} promise
 */
FlushItem.prototype.save = function () {
  return new Promise(this._saveToDisk.bind(this));
};

module.exports = FlushItem;

/**
 * Helper function
 * @param {string} storageKey - storage key
 * @param {object} items - storage items
 * @returns {*} data to be stored
 */
const convertStorage = function convertStorage (storageKey, items) {
  let itemsA = [];
  let data;
  //only for downloading we want to have an array
  if (storageKey === "downloading") {
    itemsA = [];
    for (let key in items) {
      itemsA.push(items[key]);
    }
    items = itemsA;
  }
  if (items instanceof Array) {
    data = [];
    for (let i = 0, j = items.length; i < j; i++) {
      data.push(new LinkSave(items[i]));
    }
  } else {
    data = items;
  }
  return data;
};

