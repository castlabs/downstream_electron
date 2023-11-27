/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
"use strict";
const _ = require("underscore");

const appSettings = window.require("../app-settings");
const ArrayStorage = window.require("./../util/array-storage");
const ArrayStorageBridge = window.require("./../util/array-storage-bridge");
const FlushItem = window.require("../downloads/flush-item");
const Storage = window.require("./../util/storage");
const StorageBridge = window.require("./../util/storage-bridge");
const SyncItem = window.require("../downloads/sync-item");

/**
 *
 * @constructor
 */
function DownloadsStorageController () {
  this.stores = appSettings.getSettings().stores;
  this._items = {};
  this._syncItems = [];
  this._FLUSH_TIME = 50;//in miliseconds
  this._flushThrottled = _.throttle(this._flush, this._FLUSH_TIME, {leading: false});
  this._createDummyStorageBridge();
}

/**
 *
 * @private
 * @param {string} manifestId - manifest identifier
 * @param {string} key - key identifier
 * @returns {void}
 */
DownloadsStorageController.prototype._createArrayStorage = function (manifestId, key) {
  if (!this[key]) {
    this._createArrayStorageBridge(key);
  }
  this._items[manifestId][key] = new ArrayStorage();
};

/**
 *
 * @private
 * @param {string} key - key identifier
 * @returns {void}
 */
DownloadsStorageController.prototype._createArrayStorageBridge = function (key) {
  this[key] = new ArrayStorageBridge(this, key);
};

DownloadsStorageController.prototype._createDummyStorageBridge = function () {
  this._createArrayStorageBridge(this.stores.DOWNLOADS.LEFT);
  this._createArrayStorageBridge(this.stores.DOWNLOADS.DOWNLOADED);
  this._createStorageBridge(this.stores.DOWNLOADS.DOWNLOADING);
  this._createArrayStorageBridge(this.stores.DOWNLOADS.ERRORS);
  this._createStorageBridge(this.stores.PARAMS);
  this._createStorageBridge(this.stores.MANIFEST);
  this._createStorageBridge(this.stores.STATUS);
};

/**
 *
 * @private
 * @param {string} manifestId - manifest identifier
 * @param {string} key - key identifier
 * @returns {void}
 */
DownloadsStorageController.prototype._createStorage = function (manifestId, key) {
  if (!this[key]) {
    this._createStorageBridge(key);
  }
  this._items[manifestId][key] = new Storage();
};

/**
 *
 * @private
 * @param {string} key - key identifier
 * @returns {void}
 */
DownloadsStorageController.prototype._createStorageBridge = function (key) {
  this[key] = new StorageBridge(this, key);
};

/**
 *
 * @private
 * @returns {void}
 */
DownloadsStorageController.prototype._flush = function () {
  const self = this;
  const items = this._syncItems.splice(0, this._syncItems.length);
  let flushItem, flushItems, i, item, j, k, l, manifestId, storageKey, storageKeys, storagesToFlush;
  storagesToFlush = {};

  function getItems (manifestId, storageKey) {
    if (self._items[manifestId] && self._items[manifestId][storageKey]) {
      return self._items[manifestId][storageKey].getItems();
    } else {
      return [];
    }
  }

  //collect information which storages needs to be saved
  for (i = 0, j = items.length; i < j; i++) {
    item = items[i];
    storagesToFlush[item.manifestId] = storagesToFlush[item.manifestId] || {};
    for (k = 0, l = item.storageKeys.length; k < l; k++) {
      storagesToFlush[item.manifestId][item.storageKeys[k]] = true;
    }
  }
  flushItems = [];

  //create flush items - promises that needs to be resolved together in parallel
  for (manifestId in storagesToFlush) {
    storageKeys = storagesToFlush[manifestId];
    for (storageKey in storageKeys) {
      try {
        flushItem = new FlushItem(manifestId, storageKey, getItems(manifestId, storageKey));
        flushItems.push(flushItem.save());
      } catch (e) {
        console.error("ERROR", storageKey);
      }
    }
  }

  Promise.all(flushItems)
    .then(function () {
      let i, j;
      for (i = 0, j = items.length; i < j; i++) {
        items[i].resolve();
      }
    }, function () {
      let i, j;
      for (i = 0, j = items.length; i < j; i++) {
        items[i].reject();
      }
    })
};

/**
 *
 * @private
 * @param {Array} [storageKey] storage key
 * @returns {Array} keys for all storages
 */
DownloadsStorageController.prototype._getAllStorageKeys = function (storageKey) {
  let keys = [];
  storageKey = storageKey || this.stores;
  for (let key in storageKey) {
    if (storageKey.hasOwnProperty(key)) {
      if (typeof storageKey[key] === "string") {
        //params don't need to be stored to disk
        if (key !== this.stores.PARAMS) {
          keys.push(storageKey[key]);
        }
      } else {
        keys = keys.concat(this._getAllStorageKeys(storageKey[key]));
      }
    }
  }
  return keys;
};

/**
 *
 * @private
 * @param {string} storageKey storage key identifier
 * @param {string} bridgeMethodName method name to be called
 * @param {string} manifestId - manifest identifier
 * @returns {*} items
 */
DownloadsStorageController.prototype._itemAction = function (storageKey, bridgeMethodName, manifestId) {
  let args = [], i, j;

  //collect all other parameters except those already listed
  for (i = 3, j = arguments.length; i < j; i++) {
    args.push(arguments[i]);
  }
  if (this._items[manifestId] && this._items[manifestId][storageKey] && this._items[manifestId][storageKey][bridgeMethodName]) {
    return this._items[manifestId][storageKey][bridgeMethodName].apply(this._items[manifestId][storageKey], args);
  } else {
    //if manifest still exists
    if (this._items[manifestId]) {
      console.error("ERROR", manifestId, storageKey, bridgeMethodName, args);
    }
    return undefined;
  }
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Array} [storageKeys] storage keys that will be cleared
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.clear = function (manifestId, storageKeys) {
  const self = this;
  return new Promise(function (resolve, reject) {
    storageKeys = storageKeys || self._getAllStorageKeys();
    if (self._items[manifestId]) {
      for (let i = 0, j = storageKeys.length; i < j; i++) {
        let storage = self._items[manifestId][storageKeys[i]];
        if (storage) {
          storage.clear();
        }
      }
    }
    delete (self._items[manifestId]);
    self.sync(manifestId, storageKeys)
      .then(resolve, reject);
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.create = function (manifestId) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self._items[manifestId] = {};
    self._createArrayStorage(manifestId, self.stores.DOWNLOADS.LEFT);
    self._createArrayStorage(manifestId, self.stores.DOWNLOADS.DOWNLOADED);
    self._createStorage(manifestId, self.stores.DOWNLOADS.DOWNLOADING);
    self._createArrayStorage(manifestId, self.stores.DOWNLOADS.ERRORS);
    self._createStorage(manifestId, self.stores.PARAMS);
    self._createStorage(manifestId, self.stores.MANIFEST);
    self._createStorage(manifestId, self.stores.STATUS);
    self.sync(manifestId, [
      self.stores.DOWNLOADS.DOWNLOADED,
      self.stores.MANIFEST,
      self.stores.STATUS,
    ])
      .then(resolve, reject);
  });
};
/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.createIfNotExists = function (manifestId) {
  const self = this;
  return new Promise(function (resolve, reject) {
    self.getItem(manifestId)
      .then(function (result) {
        if (result) {
          resolve()
        } else {
          self.create(manifestId)
            .then(resolve, reject);
        }
      }, reject);
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.getItem = function (manifestId) {
  const self = this;
  return new Promise(function (resolve) {
    resolve(self._items[manifestId]);
  });
};

/**
 *
 * @returns {string[]} keys of all items
 */
DownloadsStorageController.prototype.getKeys = function () {
  return Object.keys(this._items);
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {boolean} if certain manifest id exists
 */
DownloadsStorageController.prototype.keyExists = function (manifestId) {
  return !!this._items[manifestId];
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.removeItem = function (manifestId) {
  const self = this;
  return new Promise(function (resolve) {
    delete self._items[manifestId];
    resolve();
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {Array} [storageKeys] storage keys that will be synced
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.sync = function (manifestId, storageKeys) {
  const self = this;
  return new Promise(function (resolve, reject) {
    if (typeof storageKeys === "undefined") {
      reject("Storage key is missing");
      return;
    }
    if (typeof storageKeys === "string") {
      storageKeys = [storageKeys];
    }
    if (appSettings.getSettings().saveToDisk) {
      self._syncItems.push(new SyncItem(resolve, reject, manifestId, storageKeys));
      self._flushThrottled();
    } else {
      resolve();
    }
  });
};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {Promise} promise
 */
DownloadsStorageController.prototype.syncAll = function (manifestId) {
  const self = this;
  return new Promise(function (resolve, reject) {
    if (appSettings.getSettings().saveToDisk) {
      let storageKeys = self._getAllStorageKeys();
      self._syncItems.push(new SyncItem(resolve, reject, manifestId, storageKeys));
      self._flushThrottled();
    } else {
      resolve();
    }
  });
};

module.exports = DownloadsStorageController;