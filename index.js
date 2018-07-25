const { BrowserWindow, app } = require('electron');

//DEV
const downstreamElectron = require('./api/index');
// TESTING PRODUCTION
// const downstreamElectron = require('./dist/index');

const exampleFile = `file://${__dirname}/examples/main/index.html`;
const path = require("path");

function createWindow () {
  // eslint-disable-next-line no-process-env
  let appDir = path.dirname(process.mainModule.filename) + "/";

  // head request parameter test
  let useHeadRequest = true;
  // let useHeadRequest = false;
  downstreamElectron.init({
    appDir: appDir,
    numberOfManifestsInParallel: 2,
    useHeadRequests: useHeadRequest
  });
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    resizable: true,
    webPreferences: {
      plugins: true
    }
  });
  win.loadURL(exampleFile);
  win.webContents.openDevTools();
}
app.on('ready', createWindow);

app.on('window-all-closed', function () {
  console.log("window-all-closed");
  app.quit();
});
