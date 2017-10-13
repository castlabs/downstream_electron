"use strict";
const request = require('request');
const appSettings = require('../../app-settings');

const ManifestLoader = (function () {
  function ManifestLoader () {}

  ManifestLoader.prototype.load = function (url) {
    return this.sendXMLHttpRequest(url);
  };
  ManifestLoader.prototype.sendXMLHttpRequest = function (url) {
    const defaultOptions = Object.assign({}, appSettings.getSettings().defaultManifestRequestOptions);
    return new Promise(function (resolve, reject) {
      request.get(url, defaultOptions, function (error, response) {
        if (!error && response.statusCode >= 400) {
          error = response.statusMessage;
        }
        if (!error) {
          resolve({response: response.body, url: url});
        } else {
          reject(new Error("MANIFEST LOAD FAILURE " + error));
        }
      });
    });
  };
  return ManifestLoader;
}());
exports.ManifestLoader = ManifestLoader;
