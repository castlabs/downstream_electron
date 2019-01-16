/*eslint no-console: ["error", { allow: ["warn", "error", "info", "log"] }] */
/*eslint no-sync: ["off"]*/
"use strict";

const isPortTaken = require('../util/is-port-taken');
const path = require('path');
const fs = require('fs');
var fork = require('child_process').fork;
const appSettings = require("../app-settings");
const {app} = require('electron');

const CHILD_SCRIPT_FILENAME = 'startServer.js';

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
  this.childProcess = undefined;
}

/**
 * Start http server in a child_process
 * @param {object} port : on which port offline content should be served, default is 3010
 * @param {object} callback : a callback function to get listen port (if default is already taken)
 * @constructor
 */
OfflineContentServer.prototype._startServer = function (port, callback) {
  var self = this;

  // NOTE: this is so ugly FIXME
  let serverPath = path.join(app.getAppPath(), 'node_modules/downstream-electron');
  if (!fs.existsSync(path.join(serverPath, CHILD_SCRIPT_FILENAME))) {
    serverPath = path.join(app.getAppPath(), 'node_modules/downstream-electron/api/server');
    if (!fs.existsSync(path.join(serverPath, CHILD_SCRIPT_FILENAME))) {
      serverPath = app.getAppPath();
      if (!fs.existsSync(path.join(serverPath, CHILD_SCRIPT_FILENAME))) {
        serverPath = __dirname;
      }
    }
  }

  console.log('Server Path:', serverPath);
  let script = path.join(serverPath, CHILD_SCRIPT_FILENAME);
  console.log('Script for server:', script);

  //  FOR DEBUG PURPOSE self.childProcess = fork(script ,[],{execArgv:['--inspect=5860']});
  self.childProcess = fork(script, []);
  let routeName = appSettings.getSettings().downloadsName;

  // send init data for http server
  let data = {
    cmd: 'init',
    routeName: routeName,
    port: port
  };
  self.childProcess.send(data)

  self.childProcess.on('error', function (err) {
    console.error(err);
  })
  // handles message from child process
  self.childProcess.on('message', function (data) {
    if (data.cmd === 'log') {
      // http server wants to log some data
      console.log(data.log);
    }

    if (data.cmd === 'listening_port') {
      // http server is listening => notify application for listen port
      callback(data.port);
    }

    if (data.cmd === 'get_info') {

      let requestId = data.requestId;
      // http server asks data folder for manifest id
      let manifestId = data.args.manifest;

      self._offlineController.getManifestInfo(manifestId, function (err, info) {
        if (err) {
          return self.childProcess.send({error: err,
                             requestId: requestId
                            });
        }
        let downloadFolder = info.manifest.folder;
        if (!downloadFolder) {
          // try to serve from default download folder
          downloadFolder = appSettings.getSettings().downloadsFolderPath
        }

        // send response back
        return self.childProcess.send({status: 'OK', requestId: requestId, result: {folder: downloadFolder, status: info.status}});
      })
    }

    if (data.cmd === 'is_downloading') {
      let requestId = data.requestId;
      let manifestId = data.args.manifest;
      let file = data.args.file;

      let download = self._downloadController.getDownloading(manifestId, file);
      let downloadedCallback = function (err) {
        if (err) {
          return self.childProcess.send({error: err, requestId: requestId});
        }
        return self.childProcess.send({status: 'OK', requestId: requestId});
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
          return self.childProcess.send({error: err, requestId: requestId});
        }
        return self.childProcess.send({status: 'OK', requestId: requestId});
      }
      self._downloadController.performSeek(manifestId, file, downloadedCallback)
    }
  });

  self.childProcess.on('close', function (code, signal) {
    // child has closed
    if (code == null) {
      console.log('Child process closed with signal:', signal);
    } else {
      console.log('Child process closed with code:', code);
    }
  });
}
/**
 * @param {Function} callback - a callback function to get listen port (if default is taken)
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
        console.log('Port found:', port)
        self._startServer(port, function () {
          self._offlineContentPort = port;
          callback(self._offlineContentPort);
          console.info('Offline content served on port:', port);
        });
      }
    });
  }

  startOnPort(this._offlineContentPort);
}

/*
 * Stop server process
 * @returns
 */
OfflineContentServer.prototype.stop = function () {
  this.childProcess.kill('SIGTERM');
}

module.exports = OfflineContentServer;
