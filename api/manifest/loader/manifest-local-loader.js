"use strict";
const fs = window.require("fs");
const path = window.require("path");

/**
 * @param {string} url - local url
 * @returns {Promise} promise
 * @constructor
 */
function ManifestLocalLoader (url) {
  return new Promise(function (resolve, reject) {
    fs.readFile(path.resolve(url), "utf-8", function (err, content) {
      if (!err) {
        resolve(content);
      } else {
        reject(err);
      }
    });
  });
}
module.exports = ManifestLocalLoader;
