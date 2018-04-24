"use strict";
const fs = require("fs");
const path = require("path");
const appSettings = require("../app-settings");

/**
 *
 * @param {string} manifestId - manifest Id
 * @returns {Promise} promise
 */
module.exports = function (manifestId) {
  const settingsPath = path.resolve(appSettings.getSettings().settingsFolder + "/" + manifestId + "/");
  const moviePath = path.resolve(appSettings.getSettings().downloadsFolderPath + "/" + manifestId + "/");

  function dirNotExists (dirToCheck) {
    return new Promise(function (resolve /* , reject */) {
      fs.stat(dirToCheck, function (er, stat) {
        if (er) {
          resolve();
        } else {
          if (stat.isDirectory()) {
            resolve('Folder already exists');
          } else {
            resolve();
          }
        }
      });
    });
  }

  return new Promise(function (resolve, reject) {
    Promise.all([
      dirNotExists(settingsPath),
      dirNotExists(moviePath)
    ]).then(function (results) {
      results = results || [];
      const errors = results.filter(function (result) {
        return typeof result !== 'undefined';
      });
      if (errors.length) {
        reject(results);
      } else {
        resolve();
      }
    }, reject);
  });
};
