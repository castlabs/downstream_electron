/*eslint no-console: ["error", { allow: ["warn", "error", "info"] }] */
'use strict';
const WIDEVINE_SCHEME_ID_URI = 'urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed';

const remote = require('electron').remote;
const ipcRenderer = require('electron').ipcRenderer;

const translation = require("./translation/index");

let downstreamElectronFE;

function serialize (obj) {
  return JSON.stringify(obj);
}

function getWidevinePSSH (info) {
  const manifestProtections = info.manifestInfo.protections;
  let videoRepresentation = manifestProtections.video[0] || {};
  if (manifestProtections.video && info.manifest.video) {
    videoRepresentation = manifestProtections.video.filter(function (manifestProtection) {
      return info.manifest.video.indexOf(manifestProtection.id) >= 0;
    });
    videoRepresentation = videoRepresentation[0] || {};
  }

  const protections = videoRepresentation.protections || [];
  let widevinePSSH;
  for (let i = 0, j = protections.length; i < j; i++) {
    if (protections[i].schemeIdUri === WIDEVINE_SCHEME_ID_URI) {
      widevinePSSH = protections[i].cencPSSH;
      break;
    }
  }
  return widevinePSSH;
}

function bind (scope, f) {
  return function bindF () {
    f.apply(scope, arguments);
  };
}

function bindAll (scope) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let fName = arguments[i];
    scope[fName] = bind(scope, scope[fName]);
  }
}

function clonePersistentConfig (config) {
  // deep clone the config
  const clonedConfig = JSON.parse(JSON.stringify(config));
  if (typeof config.serverCertificate !== 'undefined') {
    clonedConfig.serverCertificate = config.serverCertificate;
  }
  if (typeof config.licenseRequest === 'function') {
    clonedConfig.licenseRequest = config.licenseRequest;
  }
  if (typeof config.licenseResponse === 'function') {
    clonedConfig.licenseResponse = config.licenseResponse;
  }

  return clonedConfig;
}

/**
 * @constructor
 * @namespace DownstreamElectronFE
 * @param {object} window - window object from renderer window
 * @param {Persistent} persistent - persistent helper class for creating and removing persistent session
 * @property {DownstreamElectronFE.downloads} downloads - api for downloads
 * @description
 * this a bridge class for [DownstreamElectronBE]{@link DownstreamElectronBE}
 * all methods described in ({@link DownstreamElectronFE.downloads})
 */
function DownstreamElectronFE (window, persistent) {
  let currentWindow = remote.getCurrentWindow();
  if (currentWindow) {
    this._windowId = currentWindow.id;
  }
  this._promisesObj = {};
  this._subscribersId = {};
  this._promiseCounter = 0;
  this._window = window;
  this._persistent = persistent;
  bindAll(this, '_processApi', '_beforeUnload');

  this._createApiMethods('downloads', [
    'create',
    'createPersistent',
    'getFolderInfo',
    'getList',
    'getListWithInfo',
    'getOfflineLink',
    'info',
    'remove',
    'removeAll',
    'removeAllUnfinished',
    'removePersistent',
    'resume',
    'saveData',
    'savePersistent',
    'start',
    'stop',
    'stopAll',
    'subscribe',
    'unsubscribe',
    'updateDownloadFolder'
  ]);
  this._attachEvents();
}

DownstreamElectronFE.prototype.downloads = {};

/**
 * Creates a persistent session in renderer process using external plugin defined as {@link Persistent}
 * @param {array} args - arguments
 * @param {function} resolve - should called on success
 * @param {function} reject - should called on failure
 * @returns {void}
 */
DownstreamElectronFE.prototype.downloads.createPersistent = function (args, resolve, reject) {
  const manifestId = args[0];
  const config = clonePersistentConfig(args[1]);
  const forced = args[2];
  const scope = this;
  if (this._persistent) {
    this.downloads.info(manifestId).then(function (info) {
      if (!info) {
        reject(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
        return;
      }
      const existingPersistentSessionId = info.persistent;
      if (existingPersistentSessionId && !forced) {
        reject('persistent session already exists:' + JSON.stringify(existingPersistentSessionId));
      } else {
        if (!config.pssh) {
          config.pssh = getWidevinePSSH(info);
        }

        scope._persistent.createPersistentSession(config).then(function (persistentSessionId) {
          scope.downloads.savePersistent(manifestId, persistentSessionId).then(function () {
            if (existingPersistentSessionId) {
              scope._persistent.removePersistentSession(existingPersistentSessionId)
                .then(function () {
                  resolve(persistentSessionId);
                })
                .catch(function () {
                  resolve(persistentSessionId);
                });
            } else {
              resolve(persistentSessionId);
            }
          }, reject);
        }, reject);
      }
    }, reject);
  } else {
    reject('No persistent plugin initialized');
  }
};

/**
 * Removes a persistent session in renderer process using external plugin defined as {@link Persistent}
 * @param {array} args - arguments
 * @param {function} resolve - should called on success
 * @param {function} reject - should called on failure
 * @param {object} manifest - full information about manifest
 * @returns {void}
 */
DownstreamElectronFE.prototype.downloads.removePersistent = function (args, resolve, reject, manifest) {
  if (this._persistent) {
    if (manifest && manifest.persistent) {
      this._persistent.removePersistentSession(manifest.persistent).then(resolve, reject);
    } else {
      resolve();
    }
  } else {
    reject('No persistent plugin initialized');
  }
};

/**
 * Removes a manifest - this is needed on renderer process to check for existence of persistent session
 * and then remove it if necessary
 * @param {array} args - arguments
 * @param {function} resolve - should called on success
 * @param {function} reject - should called on failure
 * @param {object} manifest - full information about manifest
 * @returns {void}
 */
DownstreamElectronFE.prototype.downloads.remove = function (args, resolve, reject, manifest) {
  const scope = this;
  if (this._persistent && manifest && manifest.persistent) {
    scope._persistent.removePersistentSession(manifest.persistent).then(resolve, reject);
  } else {
    resolve();
  }
};

/**
 * Removes all manifests - this is needed on renderer process to check for existence of persistent sessions
 * and then remove them if necessary
 * @param {array} args - arguments
 * @param {function} resolve - should called on success
 * @param {function} reject - should called on failure
 * @param {object} manifests - full information about all manifests
 * @returns {void}
 */
DownstreamElectronFE.prototype.downloads.removeAll = function (args, resolve, reject, manifests) {
  const scope = this;
  manifests = manifests || [];
  const filtered = manifests.filter(function (manifest) {
    return !!manifest.persistent;
  });
  const persistentArr = filtered.map(function (manifest) {
    return manifest.persistent;
  });

  if (this._persistent && persistentArr.length > 0) {
    let promises = [];
    for (let i = 0, j = persistentArr.length; i < j; i++) {
      promises.push(scope._persistent.removePersistentSession(persistentArr[i]));
    }
    Promise.all(promises).then(resolve, reject);
  } else {
    resolve();
  }
};

/**
 * @param {string} method - method name
 * @param {object} args - arguments
 * @param {function} originalMethod - method to ba called on renderer when main process finishes
 * @private
 * @returns {Promise} - promise
 */
DownstreamElectronFE.prototype._apiCall = function (method, args, originalMethod) {
  const self = this;
  const promiseId = this._generatePromiseId();
  const promise = new Promise(function (resolve, reject) {
    self._promisesObj[promiseId] = {
      resolve: resolve,
      reject: reject,
      method: method,
      args: args,
      originalMethod: originalMethod
    };
  });
  let request = {};
  request.promiseId = promiseId;
  request.method = method;
  request.windowId = this._windowId;
  request.args = serialize(args);
  this._send(request);
  return promise;
};

/**
 *
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._attachEvents = function () {
  const ipcRenderer = require('electron').ipcRenderer;
  ipcRenderer.on('downstreamElectronFE', this._processApi);
  this._window.addEventListener('beforeunload', this._beforeUnload);
};

/**
 *
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._beforeUnload = function () {
  this._removeSubscribers();
};

/**
 *
 * @private
 * @param {string} namespace - namespace
 * @param {array} methods - methods name array
 * @returns {
 * void}
 */
DownstreamElectronFE.prototype._createApiMethods = function (namespace, methods) {
  function apiFunction (scope, name, originalMethod) {
    return function () {
      return scope._apiCall(name, arguments, originalMethod);
    };
  }

  this[namespace] = this[namespace] || {};

  function createApiMethod (scope, namespace, name) {
    let originalMethod;
    if (typeof scope[namespace][name] === 'function') {
      originalMethod = scope[namespace][name];
    }
    scope[namespace][name] = apiFunction(scope, namespace + '.' + name, originalMethod);
  }

  for (let i = 0, j = methods.length; i < j; i++) {
    createApiMethod(this, namespace, methods[i]);
  }
};

/**
 * @private
 * @param {string} subscriberId - subscriber identifier
 * @param {object} err - error
 * @param {object} result - result
 * @param {boolean} subscriberFinished - information if the subscriber is the last one which helps to remove subscribers
 * for finished downloads
 * @returns {void}
 */
DownstreamElectronFE.prototype._executeSubscriber = function (subscriberId, err, result, subscriberFinished) {
  const subscriber = this._subscribersId[subscriberId];
  if (subscriber) {
    subscriber.callback(err, result);
  } else {
    //ignore wrong window
  }
  if (subscriberFinished && subscriber) {
    this._removeLocalSubscribers(subscriber.manifestId);
  }
};

/**
 *
 * @private
 * @returns {string} - promise identifier
 */
DownstreamElectronFE.prototype._generatePromiseId = function () {
  let ts = new Date().getTime();
  let promiseId;
  this._promiseCounter++;
  promiseId = this._promiseCounter + '-' + ts;
  return promiseId;
};

/**
 * @private
 * @param {object} obj - object to be processed
 * @param {object} evt - event
 * @returns {void}
 */
DownstreamElectronFE.prototype._processApi = function (obj, evt) {
  const promiseId = evt.promiseId;
  const error = evt.error;
  const result = evt.result;
  const promiseObj = this._promisesObj[promiseId + ''];

  function resolve (result) {
    promiseObj.resolve(result);
    this._removeLocalSubscribersForDefinedMethods(promiseObj.method, promiseObj.args[0] || result);
  }

  if (promiseObj) {
    if (evt.status === 'OK') {
      if (typeof promiseObj.originalMethod === 'function') {
        promiseObj.originalMethod.call(this, promiseObj.args, resolve.bind(this), promiseObj.reject.bind(this), result);
      } else {
        resolve.call(this, result);
      }
    } else {
      promiseObj.reject(error);
    }
    if (evt.subscribersId) {
      this._saveSubscribersId(promiseObj, evt.subscribersId);
    }
    delete(this._promisesObj[promiseId]);
  } else if (evt.subscriberId) {
    this._executeSubscriber(evt.subscriberId, evt.err, result, evt.subscriberFinished);
  } else {
    //ignore different window
  }
};

/**
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._removeSubscribers = function () {
  let request = {};
  let subscribersId;
  subscribersId = [];
  for (let key in this._subscribersId) {
    if (this._subscribersId.hasOwnProperty(key)) {
      subscribersId.push(key);
    }
  }
  request.method = 'removeSubscribers';
  request.args = serialize([subscribersId]);

  this._send(request);
};

/**
 * @param {string|array} manifestId - manifest identifier or array of manifests identifier
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._removeLocalSubscribers = function (manifestId) {
  const self = this;
  if (typeof manifestId === 'string') {
    manifestId = [manifestId];
  } else if (manifestId instanceof Array) {
    manifestId = manifestId.map(function (item) {
      if (typeof item === 'string') {
        return item;
      } else {
        return item.manifestInfo && item.manifestInfo.id;
      }
    });
  }

  function removeSubscribers (subscriberKey) {
    for (let i = 0, j = manifestId.length; i < j; i++) {
      if (typeof self._subscribersId[subscriberKey].manifestId === 'string') {
        if (self._subscribersId[subscriberKey].manifestId === manifestId[i]) {
          delete(self._subscribersId[subscriberKey]);
          break;
        }
      } else {
        let pos = self._subscribersId[subscriberKey].manifestId.indexOf(manifestId[i]);
        if (pos >= 0) {
          self._subscribersId[subscriberKey].manifestId.splice(pos, 1);
        }
        if (!self._subscribersId[subscriberKey].manifestId.length) {
          delete(self._subscribersId[subscriberKey]);
          break;
        }
      }
    }
  }

  if (manifestId) {
    for (let key in this._subscribersId) {
      if (this._subscribersId.hasOwnProperty(key)) {
        removeSubscribers(key);
      }
    }
  } else {
    this._subscribersId = {};
  }
};

/**
 *
 * @param {string} method - method name
 * @param {string|array} manifestId - manifest identifier or array of manifests identifier
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._removeLocalSubscribersForDefinedMethods = function (method, manifestId) {
  const methods = [
    'downloads.stop',
    'downloads.stopAll',
    'downloads.remove',
    'downloads.removeAll',
    'downloads.removeAllUnfinished',
    'downloads.unsubscribe'
  ];
  // remove all subscribers when user removes or stop all
  if (method === 'downloads.removeAll' || method === 'downloads.stopAll') {
    manifestId = undefined;
  }
  for (let i = 0, j = methods.length; i < j; i++) {
    if (method === methods[i]) {
      this._removeLocalSubscribers(manifestId);
      break;
    }
  }
};
/**
 * @param {Promise} promise - promise
 * @param {string} subscribersId - subscriber identifier
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._saveSubscribersId = function (promise, subscribersId) {
  let i, j;
  if (typeof subscribersId === 'string' || typeof subscribersId === 'number') {
    subscribersId = [String(subscribersId)];
  }
  for (i = 0, j = subscribersId.length; i < j; i++) {
    this._subscribersId[subscribersId[i]] = {
      manifestId: promise.args[0],
      callback: promise.args[2 + i]
    };
  }

};

/**
 * @param {object} request - request
 * @private
 * @returns {void}
 */
DownstreamElectronFE.prototype._send = function (request) {
  try {
    ipcRenderer.send('downstreamElectronBE', request);
  } catch (e) {
    console.error(e);
  }
};

//---------------------------
module.exports = {
  /**
   * @function
   * @name DownstreamElectronFE#init
   * @param {object} window - window object from renderer window
   * @param {Persistent} persistent - persistent helper class for creating and removing persistent session
   * @description
   * initialize the api in render process
   * @returns {DownstreamElectronFE} DownstreamElectronFE
   * @example
   * // somewhere in the renderer process
   * // this is example based on persistent plugin from {@link https://castlabs.com/products/prestoplay-desktop/|PRESTOplay for Desktops},
   * // you can create its own too, for details click on >> {@link Persistent} <<
   * const persistent = require('./clpp_persistent.plugin.min');
   * const downstreamElectron = require("downstream-electron").init(window, persistent);
   */
  init: function (window, persistent) {
    if (!downstreamElectronFE) {
      downstreamElectronFE = new DownstreamElectronFE(window, persistent);
    }
    return downstreamElectronFE;
  }
};
