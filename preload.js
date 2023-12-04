const {
  contextBridge,
  ipcRenderer
} = require('electron');

const downstreamElectronPreload = require('./api/downstream-electron-preload.js');

contextBridge.exposeInMainWorld(
  'utilsAPI', {

  playVideo: (
    link,
    offlineSessionId,
    config) => ipcRenderer.send(
      'utilsAPI',
      'playVideo',
      link,
      offlineSessionId,
      config),

  prepareTestFiles: (
    videoPath,
    audioPath) => ipcRenderer.invoke(
      'utilsAPI',
      'prepareTestFiles',
      videoPath,
      audioPath)
}
);