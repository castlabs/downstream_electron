const {
  contextBridge,
  ipcRenderer
} = require('electron');

contextBridge.exposeInMainWorld(
  'utilsAPI', {
  receive: (channel, func) => {
    let validChannels = ['utilsAPI'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, message, ...args) => func(event, message, ...args));
    }
  }
}
);
