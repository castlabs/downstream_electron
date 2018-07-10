"use strict";

/**
 * @typedef manifestObject
 * @property {Object} video - video representations
 * @property {Object} audio - audio representations
 * @property {Object} text - text representations
 * @property {String} id - manifest id
 */


/**
 * @memberOf DownstreamElectronFE
 * @namespace DownstreamElectronFE.downloads
 */
let downloads = {};

/**
 * create a new download, if success the result will contain "id" which should be used for other calls
 * @method create
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestUrl - manifest url
 * @param {string} customManifestId - custom manifest id, if empty, null or ''
 * the id will be generated automatically.<br>
 * The manifestId is used to also store information about movie under the same folder so if you overwrite it,
 * it will be also used as a name for folder where movie content will be stored
 * customManifestId will be validated against default regex
 * {@link DownstreamElectronBE.configuration|customManifestIdFolderRegex}
 * @example
 * var url = "http://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd";
 * DownstreamElectronFE.downloads.create(url)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * DownstreamElectronFE.downloads.create(url, '<myCustomId>')
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.create = require('./be-methods/downloads/create');

/**
 * create a persistent session
 * @method createPersistent
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @param {PersistentConfig} config - persistent configuration
 * @param {boolean} [forced=false] - replace existing persistent session, if true
 * @example
 * var config = {
 *   licenseUrl: 'https://lic.staging.drmtoday.com/license-proxy-widevine/cenc/',
 *   serverCertificate: new Uint8Array(<server_certificate>),
 *   customData: {
 *     userId: '<user_id>',
 *     sessionId: '<session_id>',
 *     merchant: '<merchant>'
 *   }
 * };
 * DownstreamElectronFE.downloads.createPersistent(manifestId, config)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.createPersistent = require('./be-methods/downloads/createPersistent');

/**
 * get ids of all downloads
 * @method getList
 * @memberOf DownstreamElectronFE.downloads
 * @example
 * DownstreamElectronFE.downloads.getList()
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.getList = require('./be-methods/downloads/get-list');

/**
 * get list of all downloads with additional info {@link manifestObject}
 * @method getListWithInfo
 * @memberOf DownstreamElectronFE.downloads
 * @example
 * DownstreamElectronFE.downloads.getListWithInfo()
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.getListWithInfo = require('./be-methods/downloads/get-list-with-info');

/**
 * get offline link for download which can be used by any player to play movie
 * @method getOfflineLink
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @example
 * DownstreamElectronFE.downloads.getOfflineLink(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.getOfflineLink = require('./be-methods/downloads/get-offline-link');

/**
 * get info for download
 * @method info
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @example
 * DownstreamElectronFE.downloads.info(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.info = require('./be-methods/downloads/info');

/**
 * removes download
 * @method remove
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @example
 * DownstreamElectronFE.downloads.remove(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.remove = require('./be-methods/downloads/remove');

/**
 * removes all downloads
 * @method removeAll
 * @memberOf DownstreamElectronFE.downloads
 * @example
 * DownstreamElectronFE.downloads.removeAll()
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.removeAll = require('./be-methods/downloads/remove-all');

/**
 * removes all unfinished downloads
 * @method removeAllUnfinished
 * @memberOf DownstreamElectronFE.downloads
 * @example
 * DownstreamElectronFE.downloads.removeAllUnfinished()
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.removeAllUnfinished = require('./be-methods/downloads/remove-all-unfinished');

/**
 * removes persistent information previously stored
 * @method removePersistent
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @example
 * DownstreamElectronFE.downloads.removePersistent(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.removePersistent = require('./be-methods/downloads/remove-persistent');

/**
 * resumes download which could be previously stopped or is broken
 * @method resume
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @example
 * DownstreamElectronFE.downloads.resume(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.resume = require('./be-methods/downloads/resume');

/**
 * Saves some user data this might be a string or json object.
 * This data will be available as "data" property for info of download
 * @method saveData
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @param {string|json} data - user data
 * @example
 * DownstreamElectronFE.downloads.saveData(manifestId, data)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.saveData = require('./be-methods/downloads/save-data');

/**
 * saves persistent session identifier
 * @method savePersistent
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @param {string} persistentSessionId - persistent session identifier
 * @example
 * DownstreamElectronFE.downloads.savePersistent(manifestId, persistentSessionId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.savePersistent = require('./be-methods/downloads/save-persistent');

/**
 * starts download
 * @method start
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @param {object} representations - representations to be downloaded, available options: 'video', 'audio', 'text'.
 * For each option please provide an array of representations id to be downloaded
 * @example
 * DownstreamElectronFE.downloads.start(manifestId, {video: ['video=400000', 'video=795000'], audio: ['audio=128000']})
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.start = require('./be-methods/downloads/start');

/**
 * stops download
 * @method stop
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @example
 * DownstreamElectronFE.downloads.stop(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.stop = require('./be-methods/downloads/stop');

/**
 * stops all downloads
 * @method stopAll
 * @memberOf DownstreamElectronFE.downloads
 * @example
 * DownstreamElectronFE.downloads.stopAll()
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.stopAll = require('./be-methods/downloads/stop-all');

/**
 * subscribe to download progress
 * @method subscribe
 * @memberOf DownstreamElectronFE.downloads
 * @param {string|array} manifestId - manifest identifier, or the array of the manifests identifier.
 * @param {number} interval - in milliseconds - how often callback onProgress should be invoked
 * @param {function} onProgress - callback to be invoked as often as defined by interval with [stats information]{@link DownloadStats}
 * @param {function} onFinish - callback to be invoked when download is finished
 * @example
 * function onProgress (err, stats) {
 *   if (err) {
 *     console.logs(stats);
 *   }
 * };
 * function onFinish (err, info) {
 *   if (err) {
 *     console.log("error", err);
 *   } else {
 *     console.log("success", info);
 *   }
 * };
 * DownstreamElectronFE.downloads.subscribe(manifestId, 1000, onProgress, onFinish)
 *    .then(
 *      function onSuccess() {console.log("subscribed successfully");},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.subscribe = require('./be-methods/downloads/subscribe');

/**
 * removes callbacks from subscribe process
 * @method unsubscribe
 * @memberOf DownstreamElectronFE.downloads
 * @param {string|array} manifestId - manifest identifier, or the array of the manifests identifier.
 * @example
 * DownstreamElectronFE.downloads.unsubscribe(manifestId)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.unsubscribe = require('./be-methods/downloads/unsubscribe');

/**
 * update download folder info for manifest id
 * this can be usefule when user has copied download folder
 * @method updateDownloadFolder
 * @memberOf DownstreamElectronFE.downloads
 * @param {string} manifestId - manifest identifier
 * @param {string} downloadFolder - new download folder path
 * @example
 * DownstreamElectronFE.downloads.updateDownloadFolder(manifestId, downloadFolder)
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
downloads.updateDownloadFolder = require('./be-methods/downloads/update-download-folder');

/**
 * remove all subscribers
 * @private
 * @method removeSubscribers
 * @memberOf DownstreamElectronFE
 * @example
 * DownstreamElectronFE.removeSubscribers()
 *    .then(
 *      function onSuccess(result) {console.log("success", result);},
 *      function onError(err) {console.log("error", err);
 *    })
 * @returns {Promise} - promise
 */
const removeSubscribers = require('./be-methods/remove-subscribers');

module.exports = {
  downloads: downloads,
  removeSubscribers: removeSubscribers
};
