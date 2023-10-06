const {BrowserWindow, app, components} = require('electron');
require('@electron/remote/main').initialize();

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let downstreamInstance;
const downstreamElectron = require('downstream-electron');


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

  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    webPreferences: {
      plugins: true,
      nodeIntegration: true,
      // NOTE: !WARNING! use with caution it allows app to download content
      //                 from any URL
      webSecurity: false,
      contextIsolation: false
    }
  });

  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    const {default: installExtension, REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS} = require('electron-devtools-installer');

    installExtension(REACT_DEVELOPER_TOOLS)
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    installExtension(REDUX_DEVTOOLS)
      .then((name) => console.log(`Added Extension: ${name}`))
      .catch((err) => console.log('An error occurred: ', err));

    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => mainWindow = null);
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

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('browser-window-created', (_, window) => {
  require("@electron/remote/main").enable(window.webContents);
});
