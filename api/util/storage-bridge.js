"use strict";
const Storage = require("./storage");
const createBridgeMethods = require("./create-bridge-methods");

/**
 * @param {DownloadsStorageController} parent - reference to parent object
 * @param {string} storageKey - storage key
 * @constructor
 */
function StorageBridge (parent, storageKey) {
  this._parent = parent;
  this._storageKey = storageKey;
  createBridgeMethods(this, Storage);
}

module.exports = StorageBridge;