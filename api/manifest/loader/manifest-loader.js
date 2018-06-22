"use strict";
const {net} = require('electron');
const appSettings = require('../../app-settings');

const ManifestLoader = (function () {
  function ManifestLoader () {}

  ManifestLoader.prototype.load = function (url) {
    return this.sendXMLHttpRequest(url);
  };
  ManifestLoader.prototype.sendXMLHttpRequest = function (url) {
    const req_options = Object.assign({
      url: url,
      method: 'GET'
    }, appSettings.getSettings().defaultManifestRequestOptions);

    return new Promise(function (resolve, reject) {
      let req = net.request(req_options);

      req.on('error', (err) => {
        reject(err);
      });

      req.on('response', (response) => {

        response.on("error", function (error) {
          reject(new Error("MANIFEST LOAD FAILURE " + error));
        });

        let error;
        if (response.statusCode >= 400) {
            error = response.statusMessage;
        }

        if (!error) {
          let body = [];
          response.on('data', (chunk) => {
            body.push(chunk);
          }).on('end', () => {
            body = Buffer.concat(body);
            resolve({response: body, url: url});
          });
        } else {
            reject(new Error("MANIFEST LOAD FAILURE " + error));
        }
      });
      req.end();
    });
  };
  return ManifestLoader;
}());
exports.ManifestLoader = ManifestLoader;
