/**
 * 
 * Basic Actions for React Componenets
 * 
 */

/**
 * 
 * @param {*} url 
 */
export const playStream = url => {
  playVideo(url);

  return {
    type: 'PLAY_STREAM',
    url
  }
}

/**
 * 
 * @param {*} offlineUrl 
 */
export const playOfflineStream = offlineUrl => {
  playVideo(offlineUrl);

  return {
    type: 'PLAY_OFFLINE_STREAM',
    url: offlineUrl
  }
}

/**
 * 
 * @param {*} link 
 */
function playVideo (link) {
  const {BrowserWindow} = require('electron');

  let playerWindow = new BrowserWindow({
    width: 860,
    height: 600,
    show: true,
    resizable: true,
    webPreferences: {
      plugins: true,
      // NOTE: !WARNING! use with caution it allows app to download content
      //                 from any URL
      webSecurity: false
    }
  });

  playerWindow.loadURL('http://localhost:3000/player/index.html');
  playerWindow.webContents.openDevTools();
  playerWindow.webContents.on('did-finish-load', function (evt, args) {
    playerWindow.webContents.send('startPlaybackStream', {
      url: link,
      configuration: {},
      offlineSessionId: ''
    });
  });
}
