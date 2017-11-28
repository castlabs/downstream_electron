"use strict";
const electronFetch = require('electron-fetch');
const appSettings = require('../../app-settings');

const ManifestLoader = (function () {
  function ManifestLoader () {}

  ManifestLoader.prototype.load = function (url) {
    return this.sendXMLHttpRequest(url);
  };
  ManifestLoader.prototype.sendXMLHttpRequest = function (url) {
    const defaultOptions = Object.assign({}, appSettings.getSettings().defaultManifestRequestOptions);
    return new Promise(function (resolve, reject) {
      electronFetch(url, defaultOptions)
        .then((res) => res.text())
        .then((body) => {
          resolve({response: body, url: url});
        })
        .catch((err) => {
          reject(new Error("MANIFEST LOAD FAILURE " + err))
        });
    });
  };
  return ManifestLoader;
}());

exports.ManifestLoader = ManifestLoader;
