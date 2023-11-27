/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
"use strict";
const _ = require('underscore');
const Snowflake = require("./util/snowflake-id");

const appSettings = require('./app-settings');
const beMethods = require('./be-methods-all');
const DownloadsController = require('./controllers/downloads-controller');
const ManifestController = require('./controllers/manifest-controller');
const OfflineController = require('./controllers/offline-controller');
const SubscribersController = require('./controllers/subscribers-controller');
const Server = require('./server/server.js');

let DownstreamElectronBE;

function deserialize (serializedJavascript) {
  try {
    return JSON.parse(serializedJavascript);
  } catch (err) {
    return {};
  }
}

/**
 * @constructor
 * @namespace DownstreamElectronBE
 * @param {object} configParams - configuration
 * @property {DownstreamElectronBE.init} init - initialize api in main process
 * @description
 * During initialization you can configure your app, [click here]{@link DownstreamElectronBE.configuration}
 *
 * @example
 * //somewhere in the main process
 * const { BrowserWindow, app } = require('electron');
 * const downstreamElectron = require('downstream-electron');
 *
 * const userSettings = {
 *   "appDir": "/Users/admin/myApp",
 *   "settingsName": "settings",
 *   "publicName": "public",
 *   "downloadsName": "movies"
 * };
 *
 * let downstreamInstance;
 * function createWindow() {
 *   downstreamInstance = downstreamElectron.init(userSettings);
 *   const win = new BrowserWindow({
 *     width: 1200,
 *     height: 700,
 *     resizable: true,
 *     webPreferences: {
 *       plugins: true,
 *       nodeIntegration: true
 *     }
 *   });
 *   win.loadURL('file://index.html');
 *   win.webContents.openDevTools();
 * }
 *
 * function onWillQuit() {
 *  downstreamInstance.stop();
 * }
 *
 * app.on('ready', createWindow);
 * app.on('will-quit', onWillQuit);
 * app.on('window-all-closed', function () {
 *  console.log("window-all-closed");
 *  app.quit();
 * });
 */
DownstreamElectronBE = function () {
  this._offlineContentPort = appSettings.getSettings().offlineContentPortStart;
  _.bindAll(this, "_onApiRequest", "processSubscriber");
  this._createControllers();
  this._serveOfflineContent();
  this._attachEvents();
  // this.offlineController.restoreLocalManifest("6163760572308389888");
};

DownstreamElectronBE.prototype.stop = function () {
  this.server.stop();
}

/**
 *
 * @param {string} methodName - api function
 * @param {string} promiseId - promise identifier
 * @param {object} args - arguments
 * @param {number} target - target window id
 * @private
 * @returns {void}
 */
DownstreamElectronBE.prototype._apiMethods = function (methodName, promiseId, args, target) {
  const self = this;
  const manifestId = args[0];
  let response = {};
  response.promiseId = promiseId;
  const onSuccess = function (result, subscribersId) {
    response.subscribersId = subscribersId;
    response.status = "OK";
    response.result = result;
    response.manifestId = manifestId;
    self._send(response, target);
  };
  const onFailure = function (err, internalError) {
    const errorId = String(Snowflake.SnowflakeId.getUUID());
    const errorInfo = _.clone({
      errorId: errorId,
      methodName: methodName,
      args: args.slice(4),
      err: err,
      internalError: internalError
    });
    response.manifestId = manifestId;
    response.status = "ERROR";
    response.error = err || {};
    response.error.errorId = errorId;
    response.error.details = internalError;

    self._send(response, target);

    // @TODO log all errors that user have seen, the errorId will help to find stack
    try {
      console.error(new Date(), "Error occurred", JSON.stringify(errorInfo));
    } catch (e) {
      //do nothing
    }
  };
  args = args || [];
  args.unshift(target);
  args.unshift(onFailure);
  args.unshift(onSuccess);
  args.unshift(this);
  const method = this._getMethod(methodName);
  if (typeof method === "function") {
    method.apply(null, args);
  } else {
    response.status = "ERROR";
    response.error = "Provided method '" + methodName + "' doesn't exists";
    this._send(response, target);
    console.error("ERROR", "Provided method '" + methodName + "' doesn't exists");
  }
};

/**
 *
 * @private
 * @returns {void}
 */
DownstreamElectronBE.prototype._attachEvents = function () {
  const ipcMain = require('electron').ipcMain;
  ipcMain.on("downstreamElectronBE", this._onApiRequest);
};

/**
 *
 * @private
 * @returns {void}
 */
DownstreamElectronBE.prototype._createControllers = function () {
  this.manifestController = new ManifestController();
  this.offlineController = new OfflineController(this.manifestController);
  this.downloadsController = new DownloadsController(this.manifestController, this.offlineController);
  this.subscribersController = new SubscribersController();
};

/**
 *
 * @param {string} methodName - method name
 * @returns {*} - method
 * @private
 */
DownstreamElectronBE.prototype._getMethod = function (methodName) {
  const names = methodName.split(".");
  let i, j, method;
  method = beMethods[names[0]];
  for (i = 1, j = names.length; i < j; i++) {
    method = method[names[i]];
  }
  return method;
};

/**
 *
 * @param {object} evt - event
 * @param {object} data - data from renderer
 * @param {number} target - target window id
 * @private
 * @returns {void}
 */
DownstreamElectronBE.prototype._onApiRequest = function (evt, data, target) {
  const promiseId = data.promiseId;
  const argsObj = deserialize(data.args) || {};
  const method = data.method;
  const windowId = data.windowId;
  target = windowId;
  let args = [];
  let i = 0;
  while (argsObj.hasOwnProperty(i)) {
    args.push(argsObj[i]);
    i++;
  }
  this._apiMethods(method, promiseId, args, target);
};

/**
 * @private
 * @param {object} response - response
 * @param {number} target - window target id
 * @returns {void}
 */
DownstreamElectronBE.prototype._send = function (response, target) {
  try {
    const windows = require('electron').BrowserWindow.getAllWindows();
    for (let i = 0, j = windows.length; i < j; i++) {
      if (windows[i].id === target) {
        windows[i].webContents.send('downstreamElectronFE', response);
        break;
      }
    }
  } catch (err) {
    console.error("internal error ocurred", err);
  }
};

/**
 * @private
 * @returns {void}
 */
DownstreamElectronBE.prototype._serveOfflineContent = function () {
  const self = this;
  const maxOfflineContentPortRange = appSettings.getSettings().maxOfflineContentPortRange;

  this.server = new Server(this.offlineController, this.downloadsController, maxOfflineContentPortRange, this._offlineContentPort);
  this.server.serveOfflineContent(function (offlinePort) {
    self._offlineContentPort = offlinePort;
  })

};

/**
 *
 * @param {string} manifestId - manifest identifier
 * @returns {string} - offline path
 */
DownstreamElectronBE.prototype.getOfflinePath = function (manifestId) {
  let offlinePath = appSettings.getSettings().offlineDomain;
  let offlineContentPort = this._offlineContentPort;
  if (offlineContentPort) {
    offlinePath += ":" + offlineContentPort;
  }
  offlinePath += "/" + encodeURIComponent(appSettings.getSettings().downloadsName) + "/" + encodeURIComponent(manifestId) + "/";
  return offlinePath;
};

/**
 *
 * @param {string} subscriberId - subscriber identifier
 * @param {object} err - error
 * @param {object} result - result
 * @param {number} target - window target id
 * @param {boolean} subscriberFinished - download finished
 * @returns {void}
 */
DownstreamElectronBE.prototype.processSubscriber = function (subscriberId, err, result, target, subscriberFinished) {
  let response = {};
  response.subscriberId = subscriberId;
  response.status = err ? "ERROR" : "OK";
  response.err = err;
  response.result = result;
  response.subscriberFinished = subscriberFinished;
  this._send(response, target);
  if (subscriberFinished) {
    this.subscribersController.removeAllManifestSubscribersById(subscriberId);
  }
};

//---------------------------
module.exports = {
  init: function (userSettings) {
    appSettings.load(userSettings);
    return new DownstreamElectronBE();
  }
};
