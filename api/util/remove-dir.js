/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
'use strict';

const fs = require('fs');
const path = require('path');
const downloadFileUtil = require("../downloads/download-file-util");

function removeDir (dir, cb, ENOTEMPTY_attempts) {
  ENOTEMPTY_attempts = ENOTEMPTY_attempts || 0;
  const ENOTEMPTY_maxAttempts = 10;
  const ENOTEMPTY_TIMEOUT = 500;

  if (typeof dir !== 'string') {
    throw new Error('directory path required');
  }

  if (cb !== undefined && typeof cb !== 'function') {
    throw new Error('callback must be function');
  }

  const self = this;

  let called, results;

  downloadFileUtil.checkForLocalFile(dir, function existsCallback (exists) {
    if (!exists) {
      return removeDirCallback(null);
    }
    fs.stat(dir, function statCallback (err, stat) {
      if (err) {
        return removeDirCallback(err);
      }
      if (!stat.isDirectory()) {
        return fs.unlink(dir, removeDirCallback);
      }
      fs.readdir(dir, readdirCallback);
    });

    function readdirCallback (err, files) {
      if (err) {
        return removeDirCallback(err);
      }

      let n = files.length;
      if (n === 0) {
        return fs.rmdir(dir, removeDirCallback);
      }

      files.forEach(function (name) {
        removeDir(path.resolve(dir, name), function (err) {
          if (err) {
            return removeDirCallback(err);
          }
          if (--n === 0) {
            return fs.rmdir(dir, removeDirCallback);
          }
        });
      });
    }
  });

  function removeDirCallback (err) {
    if (err && err.code === "ENOTEMPTY") {
      if (ENOTEMPTY_attempts < ENOTEMPTY_maxAttempts) {
        ENOTEMPTY_attempts++;
        console.error("ERROR ENOTEMPTY", dir, ENOTEMPTY_attempts);
        setTimeout(function () {
          removeDir(dir, cb, ENOTEMPTY_attempts);
        }, ENOTEMPTY_TIMEOUT);
        return;
      }
    }
    if (err && err.code === 'ENOENT') {
      arguments[0] = null;
    }

    if (!results) {
      results = arguments;
    }
    if (!cb || called) {
      return;
    }
    called = true;
    cb.apply(self, results);
  }
}

module.exports = removeDir;
