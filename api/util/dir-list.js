"use strict";
const fs = require("fs");
const path = require("path");
/**
 * @param {string} dir - folder path
 * @param {string} itemName - folder or file name
 * @param {boolean} includeFolders - if folders should be included
 * @param {boolean} includeFiles - if files should be included
 * @returns {Promise} promise
 */
function filterDirItem (dir, itemName, includeFolders, includeFiles) {
  const folderPath = path.resolve(dir + "/" + itemName);
  return new Promise(function (resolve, reject) {
    fs.stat(folderPath, function (err, stat) {
      if (err) {
        reject(err);
        return;
      }
      if (stat.isDirectory()) {
        if (!includeFolders) {
          itemName = undefined;
        }
        resolve(itemName)
      } else {
        if (!includeFiles) {
          itemName = undefined;
        }
        resolve(itemName)
      }
    });
  });
}

/**
 * @param {string} dir - folder path
 * @param {boolean} includeFolders - if folders should be included
 * @param {boolean} includeFiles - if files should be included
 * @returns {Promise} promise
 */
function dirList (dir, includeFolders, includeFiles) {
  if (typeof includeFolders === "undefined") {
    includeFolders = true;
  }
  if (typeof includeFiles === "undefined") {
    includeFiles = true;
  }
  return new Promise(function (resolve, reject) {
    fs.readdir(dir, function (err, folders) {
      if (err) {
        //not found return empty list, there was another error ENOTDIR but it seems like this is not a valid case anyway
        if (err.code === "ENOENT" || err.code === "ENOTDIR") {
          resolve([]);
        } else {
          reject(err.message);
        }
      } else {
        let foldersPromises = [];
        for (let i = 0, j = folders.length; i < j; i++) {
          foldersPromises.push(filterDirItem(dir, folders[i], includeFolders, includeFiles));
        }
        Promise.all(foldersPromises).then(function (results) {
          resolve(results.filter(function (folderName) {
            return typeof folderName !== "undefined"
          }));
        }, function (promiseError) {
          reject(promiseError);
        });
      }
    });
  });
}

module.exports = dirList;
