"use strict";
const mkdirp = require("mkdirp");
const fs = require("fs");
const path = require("path");

function saveFile (filePath, fileName, value, callback) {
  mkdirp(filePath).then(function () {
    const fileUrl = path.resolve(filePath + "/" + fileName);
    fs.writeFile(fileUrl, value, "utf-8", callback);
  }, function (error) {
    callback(error);
  });
}

module.exports = saveFile;
