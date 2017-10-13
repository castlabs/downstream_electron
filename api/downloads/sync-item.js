"use strict";

function SyncItem (resolve, reject, manifestId, storageKeys) {
  this.resolve = resolve;
  this.reject = reject;
  this.manifestId = manifestId;
  this.storageKeys = storageKeys;
}

module.exports = SyncItem;
