"use strict";
const mkdirp = require('mkdirp');

/**
 *
 * @param {string} localPath - local path
 * @returns {Promise} promise
 */
module.exports = function (localPath) {
  return new Promise(function (resolve, reject) {
    mkdirp(localPath, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve()
      }
    });
  })
};
