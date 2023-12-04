const {
  contextBridge,
  ipcRenderer
} = require('electron');

const downstreamElectron = require('./downstream-electron-fe.js');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'downstreamElectronAPI', {
  init: (window, persitance) => {
    return downstreamElectron.init(window, persitance);
  },
  send: (channel, data) => {
    // whitelist channels
    let validChannels = ['downstreamElectronBE'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    let validChannels = ['downstreamElectronFE'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(event, args.find(() => true)));
    }
  }
}
);