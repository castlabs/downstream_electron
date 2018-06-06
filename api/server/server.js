/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
"use strict";

const express = require('express');
const cors = require('cors');

const isPortTaken = require('../util/is-port-taken');

/**
 * Offline content server
 * @param {object} offlineController : offline controller
 * @param {string} maxOfflineContentPortRange - max range for offline port to on which content can be served
 * @param {string} offlineContentPort - on which port offline content should be served, default is 3010
 * @constructor
 */
function OfflineContentServer (offlineController, maxOfflineContentPortRange, offlineContentPort) {
  this._offlineController = offlineController;
  this._maxOfflineContentPortRange = maxOfflineContentPortRange;
  this._offlineContentPort = offlineContentPort;
  this._server = express();
  this._server.use(cors());

  require('./contentRoute')(this._server, this._offlineController);
}

/**
 * @param {Function} callback - a callback function to get listen port (if default is taken)
 * @param {string} storageKey - storage key
 * @constructor
 */
OfflineContentServer.prototype.serveOfflineContent = function (callback) {
  const self = this;

  function startOnPort (port) {
    if (port > self._maxOfflineContentPortRange) {
      return;
    }
    isPortTaken(port, function (err) {
      if (err) {
        port++;
        startOnPort(port);
      } else {
        self._server.listen(port, function () {
          self._offlineContentPort = port;
          callback(self._offlineContentPort);
          console.info('Offline content served on port ' + port);
        });
      }
    });
  }

  startOnPort(this._offlineContentPort);
}

module.exports = OfflineContentServer;
