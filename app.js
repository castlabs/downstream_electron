const {
  BrowserWindow,
  app,
  components,
  ipcMain
} = require('electron');
const fs = require('fs');

// TESTING PRODUCTION
let index = './index';
if (!fs.existsSync(index)) {
  //DEV
  index = './api/index';
}
let downstreamInstance;
const downstreamElectron = require(index);

let example = 'main';
process.argv.forEach(function (val, index, array) {
  let params = val.split('=', 2);
  if (!Array.isArray(params) || params.length < 2) {
    return;
  }

  if (params[0] === 'example') {
    example = params[1];
  }
});

const exampleFile = `file://${__dirname}/examples/${example}/index.html`;
const path = require('path');
// default value of allowRendererProcessReuse false is deprecated
app.allowRendererProcessReuse = true;

function createWindow () {
  // eslint-disable-next-line no-process-env
  let appDir = path.dirname(process.mainModule.filename) + '/';
  // head request parameter test
  let useHeadRequest = true;

  // let useHeadRequest = false;
  downstreamInstance = downstreamElectron.init({
    appDir: appDir,
    numberOfManifestsInParallel: 2,
    useHeadRequests: useHeadRequest
  });

  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      plugins: true,
      nodeIntegration: true,
      // NOTE: !WARNING! use with caution it allows app to download content
      //                 from any URL
      webSecurity: false
    }
  });

  win.loadURL(exampleFile);
  win.webContents.openDevTools();
}

function onWillQuit () {
  downstreamInstance.stop();
}

app.whenReady().then(async () => {
  await components.whenReady();
  console.log('components ready:', components.status());
  createWindow();
});

app.on('will-quit', onWillQuit);

app.on('window-all-closed', () => {
  console.log('window-all-closed');
  app.quit();
});

function playVideo (link, offlineSessionId, config) {
  let playerWindow = new BrowserWindow({
    width: 860,
    height: 600,
    show: true,
    resizable: true,
    webPreferences: {
      plugins: true,
      preload: path.join(__dirname, 'player/preload.js'),
      // NOTE: !WARNING! use with caution it allows app to download content
      //                 from any URL
      webSecurity: false
    }
  });

  const playerUrl = `file://${__dirname}/player/index.html`;

  playerWindow.loadURL(playerUrl);
  playerWindow.webContents.openDevTools();
  playerWindow.webContents.on('did-finish-load', function (evt, args) {
    playerWindow.webContents.send('utilsAPI', 'startPlaybackStream', {
      url: link,
      configuration: config,
      offlineSessionId: offlineSessionId
    });
  });
}

ipcMain.on('utilsAPI', (event, message, ...args) => {
  if (message === 'playVideo') {
    playVideo(...args);
  }
});


ipcMain.handle('utilsAPI', (event, message, ...args) => {
  if (message === 'prepareTestFiles') {
    var videoPath = args[0];
    var audioPath = args[1];

    return [
      fs.readFileSync(videoPath).buffer,
      fs.readFileSync(audioPath).buffer];
  }
});