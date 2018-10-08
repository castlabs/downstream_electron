/*eslint no-console: ["error", { allow: ["warn", "error", "info", "log"] }] */
/*eslint no-sync: ["off"]*/
"use strict";

const isPortTaken = require('../util/is-port-taken');
const path = require('path');
const fs = require('fs');
var fork = require('child_process').fork;
const appSettings = require("../app-settings");
const {app} = require('electron');

/**
 * Offline content server
 * @param {object} offlineController : offline controller
 * @param {object} downloadController : download controller
 * @param {string} maxOfflineContentPortRange - max range for offline port to on which content can be served
 * @param {string} offlineContentPort - on which port offline content should be served, default is 3010
 * @constructor
 */
function OfflineContentServer (offlineController, downloadController, maxOfflineContentPortRange, offlineContentPort) {
  this._offlineController = offlineController;
  this._downloadController = downloadController;
  this._maxOfflineContentPortRange = maxOfflineContentPortRange;
  this._offlineContentPort = offlineContentPort;
}

/**
 * Start http server in a child_process
 * @param {object} port : on which port offline content should be served, default is 3010
 * @param {object} callback : a callback function to get listen port (if default is already taken)
 * @constructor
 */
OfflineContentServer.prototype._startServer = function (port, callback) {
  var self = this;

  let serverPath = path.join(app.getAppPath(), 'node_modules/downstream-electron/api/server');
  if (!fs.existsSync(serverPath)) {
    serverPath = __dirname;
  }
  console.log('server Path : ', serverPath);
  let script = path.join(serverPath, 'startServer.js');
  console.log('script for server: ', script);

  //  FOR DEBUG PURPOSE var child = fork(script ,[],{execArgv:['--inspect=5860']});
  var child = fork(script, []);
  let routeName = appSettings.getSettings().downloadsName;

  // send init data for http server
  let data = {
    cmd: 'init',
    routeName: routeName,
    port: port
  };
  child.send(data)

  child.on('error', function (err) {
    console.error(err);
  })
  // handles message from child process
  child.on('message', function (data) {
    if (data.cmd === 'log') {
      // http server wants to log some data
      console.log(data.log);
    }

    if (data.cmd === 'listening_port') {
      // http server is listening => notify application for listen port
      callback(data.port);
    }

    if (data.cmd === 'get_folder') {

      let requestId = data.requestId;
      // http server asks data folder for manifest id
      let manifestId = data.args.manifest;

      self._offlineController.getManifestInfo(manifestId, function (err, info) {
        if (err) {
          return child.send({error: err,
                             requestId: requestId
                            });
        }
        let downloadFolder = info.manifest.folder;
        if (!downloadFolder) {
          // try to serve from default download folder
          downloadFolder = appSettings.getSettings().downloadsFolderPath
        }

        // send response back
        return child.send({status: 'OK', requestId: requestId, result: {folder: downloadFolder}});
      })
    }

    if (data.cmd === 'is_downloading') {
      let requestId = data.requestId;
      let manifestId = data.args.manifest;
      let file = data.args.file;

      let download = self._downloadController.getDownloading(manifestId, file);
      let downloadedCallback = function (err) {
        if (err) {
          return child.send({error: err, requestId: requestId});
        }
        return child.send({status: 'OK', requestId: requestId});
      }
      if (download) {
        // file is created but being downloading => wait for download before sending result
        self._downloadController.waitForDownload(download, downloadedCallback);
      } else {
        return downloadedCallback();
      }
    }

    if (data.cmd === 'perform_seek') {
      let requestId = data.requestId;
      let manifestId = data.args.manifest;
      let file = data.args.file;
      let downloadedCallback = function (err) {
        if (err) {
          return child.send({error: err, requestId: requestId});
        }
        return child.send({status: 'OK', requestId: requestId});
      }
      self._downloadController.performSeek(manifestId, file, downloadedCallback)
    }
  });

  child.on('close', function (code) {
    // child has closed
    console.log('child process closed ' + code);
  });
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
        console.log('port found :', port)
        self._startServer(port, function () {
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
