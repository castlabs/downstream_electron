"use strict";
const ArrayStorage = require("./array-storage");
const createBridgeMethods = require("./create-bridge-methods");

/**
 * @param {DownloadsStorageController} parent - reference to parent object
 * @param {string} storageKey - storage key
 * @constructor
 */
function ArrayStorageBridge (parent, storageKey) {
  this._parent = parent;
  this._storageKey = storageKey;
  createBridgeMethods(this, ArrayStorage);
}

module.exports = ArrayStorageBridge;