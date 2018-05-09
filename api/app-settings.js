"use strict";

/**
 * @typedef Configuration
 * @property {string=} appDir main directory path, can be any valid path, default is electronApp.getPath('userData')
 * @property {string=} settingsName - name of the folder in main directory path where to store settings
 * @property {string=} publicName - name of the folder in main directory path which will be served over http
 * @property {string=} downloadsName - name of the folder in main directory path and publicName where to store assets
 * @property {string=} offlineDomain - on which domain the content should be served, default is 127.0.0.1
 * @property {string=} offlineContentPortStart - on which port offline content should be served, default is 3010
 * @property {string=} maxOfflineContentPortRange - max range for offline port to on which content can be served
 *   It will try from {offlineContentPortStart} and if taken it will try next until it finds a free one
 * @property {string=} numberOfManifestsInParallel - max number of manifest that can be downloaded at the same time,
 *   the rest will go into queue.
 *   Be reasonable here, as it might slow down your computer, default value is 2. With 10 and very larges manifests
 *   it might go to hundreds of chunks (50 files can be downloaded at the same time per manifest). Also the highger number
 *   doesn't mean it will downloads all movies faster. You should find here some balance.
 *   Seems like 2-3 manifests gives the best results, 1 manifest limitation might work better for slower computers.
 * @property {string=} customManifestIdFolderRegex - regex to use to validate custom manifest id - bear in mind that this
 * need to be also a valid folder name.<br>
 * By default it matches any letter or number or unicode characters (regional characters) or "-" or "_" as a first character<br>
 * Then it may have any letter or number or unicode characters (regional characters) or space or any of the following characters:
 * ,.;'[]{}!@#$%&*()-_=+
 *
 * @property {string=} openingTagForInvalidCustomManifestIdCharacter - when customManifestId is being invalidated
 * against customManifestIdFolderRegex it will raise the error and include the customManifestId with marked invalid characters
 * this is the opening tag to be added before invalid character
 *
 * @property {regex=} closingTagForInvalidCustomManifestIdCharacter - when customManifestId is being invalidated
 * against customManifestIdFolderRegex it will raise the error and include the customManifestId with marked invalid characters
 * this is the closing tag to be added after invalid character
 *
 * @namespace DownstreamElectronBE.configuration
 * @description
 * During initialization you can configure your app
 * @example
 * //somewhere in the main process
 * const downstreamElectron = require('downstream-electron');
 * const userSettings = {
 *   appDir: "/Users/admin/myApp",
 *   settingsName: "settings",
 *   publicName: "public",
 *   downloadsName: "movies"
 *   numberOfManifestsInParallel: 3
 * };
 * function createWindow() {
 *   downstreamElectron.init(userSettings);
 *   const win = new BrowserWindow({
 *     width: 1200,
 *     height: 700,
 *     resizable: true,
 *     webPreferences: {
 *       plugins: true
 *     }
 *   });
 *   win.loadURL('file://index.html');
 *   win.webContents.openDevTools();
 * }
 * app.on('ready', createWindow);
 */

const electronApp = require("electron").app;
const path = require("path");
let settings = {
  downloadingThreadsRules: {
    items: [
      {max: 10, files: 5},
      {max: 100, files: 10},
      {max: 1000, files: 30},
      {max: 100000, files: 50}
    ],
    threads: [
      {size: 10, number: 1},
      {size: 100, number: 3},
      {size: 1000, number: 4},
      {size: 100000, number: 5}
    ]
  },
  MAX_ERRORS_DOWNLOAD_RETRY: 5,
  MAX_INTERNET_ERRORS_DOWNLOAD_CHUNK_RETRY: 100,
  MAX_ERRORS_DOWNLOAD_CHUNK_RETRY: 5,
  offlineDomain: "http://127.0.0.1",
  offlineContentPortStart: 3010,
  maxOfflineContentPortRange: 3030,
  numberOfManifestsInParallel: 2,
  stores: {
    DOWNLOADS: {
      "LEFT": "left",
      "DOWNLOADING": "downloading",
      "DOWNLOADED": "downloaded",
      "ERRORS": "errors"
    },
    STATUS: "status",
    PARAMS: "params",
    MANIFEST: "manifest",
    PERSISTENT: "persistent",
    DATA: "data"
  },
  saveToDisk: true,
  times: {
    DOWNLOAD_TIMEOUT: 5000,
    RETRY_TIMEOUT: 5000
  },
  defaultManifestRequestOptions: {
    headers: {
      "Accept": "*/*",
      // 'Accept-Encoding': 'gzip, deflate, br', // gzip doesn't work
      // 'Accept-Language': 'en-US,en;q=0.8,pl;q=0.6',
      // 'Cache-Control': 'no-cache',
      // 'Connection': 'keep-alive', // @TODO investigate it
      // 'Pragma': 'no-cache',
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Electron/1.8.6 Safari/537.36"
    },
    timeout: 5000
  },
  // matches any letter or number or unicode characters (regional characters) or "-" or "_" as a start
  // then it may have any letter or number or unicode characters (regional characters) or space or any of the following characters
  // ,.;'[]{}!@#$%&*()-_=+
  // and is all case insensitive
  customManifestIdFolderRegex: /^([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\-|\_){1,1}([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\ |\,|\.|\;|\'|\[|\]|\{|\}|\!|\@|\#|\$|\%|\&|\*|\(|\)|\-|\_|\=|\+?){0,49}$/i,
  openingTagForInvalidCustomManifestIdCharacter: '<span style=\'background-color:blue;\'>',
  closingTagForInvalidCustomManifestIdCharacter: '</span>'
};

function loadUserSettings (jsonSettings) {
  let appDir = electronApp.getPath("userData");

  let settingsName = "settings";
  let publicName = "public";
  let downloadsName = "movies";

  if (jsonSettings) {
    if (jsonSettings.appDir) {
      appDir = jsonSettings.appDir;
    }
    if (jsonSettings.settingsName) {
      settingsName = jsonSettings.settingsName;
    }
    if (jsonSettings.publicName) {
      publicName = jsonSettings.publicName;
    }
    if (jsonSettings.downloadsName) {
      downloadsName = jsonSettings.downloadsName;
    }
    if (jsonSettings.offlineDomain) {
      settings.offlineDomain = jsonSettings.offlineDomain;
    }
    if (jsonSettings.offlineContentPortStart) {
      settings.offlineContentPortStart = jsonSettings.offlineContentPortStart;
    }
    if (jsonSettings.maxOfflineContentPortRange) {
      settings.maxOfflineContentPortRange = jsonSettings.maxOfflineContentPortRange;
    }
    if (jsonSettings.numberOfManifestsInParallel) {
      settings.numberOfManifestsInParallel = jsonSettings.numberOfManifestsInParallel;
    }
    if (jsonSettings.customManifestIdFolderRegex) {
      settings.customManifestIdFolderRegex = jsonSettings.customManifestIdFolderRegex;
    }
    if (jsonSettings.openingTagForInvalidCustomManifestIdCharacter) {
      settings.openingTagForInvalidCustomManifestIdCharacter = jsonSettings.openingTagForInvalidCustomManifestIdCharacter;
    }
    if (jsonSettings.closingTagForInvalidCustomManifestIdCharacter) {
      settings.closingTagForInvalidCustomManifestIdCharacter = jsonSettings.closingTagForInvalidCustomManifestIdCharacter;
    }
  }

  appDir = path.join(path.resolve(appDir), "/");

  let settingsFolder = path.join(path.resolve(appDir + settingsName) + "/", "/");

  let publicFolderPath = path.join(path.resolve(appDir + publicName) + "/", "/");

  let downloadsFolderPath = path.join(path.resolve(publicFolderPath + downloadsName) + "/", "/");

  settings.appDir = appDir;
  settings.downloadsFolderPath = downloadsFolderPath;
  settings.downloadsName = downloadsName;
  settings.publicFolderPath = publicFolderPath;
  settings.settingsFolder = settingsFolder;

  // console.log('appDir:', appDir);
}

function getSettings () {
  return settings;
}

exports.load = loadUserSettings;
exports.getSettings = getSettings;
