"use strict";
const jsonfile = window.require("jsonfile");
const path = window.require("path");

const appSettings = require('../app-settings');

/**
 *
 * @param {string} manifestId - manifest identifier
 * @param {string} itemName - item name
 * @returns {Promise} promise
 * @constructor
 */
function ReadItem (manifestId, itemName) {
  if (!manifestId) {
    throw new Error("manifestId is missing");
  }
  this._manifestId = manifestId;
  this._itemName = itemName;
  return new Promise(this._read.bind(this));
}

/**
 *
 * @param {function} resolve - callback to be invoked on finish
 * @private
 * @returns {void}
 */
ReadItem.prototype._read = function (resolve) {
  const fileUrl = path.resolve(appSettings.getSettings().settingsFolder + "/" + this._manifestId + "/" + this._itemName + ".json");
  jsonfile.readFile(fileUrl, function (err, data) {
    if (err) {
      resolve();
    } else {
      resolve(data);
    }
  });
};

module.exports = ReadItem;