const {ipcRenderer} = require('electron');
const ShakaPlayer = require('shaka-player').Player;
ipcRenderer.on('startPlaybackStream', (evt, args) => {
  var url = args.url;

  var video = document.querySelector('#video');
  window.player = new ShakaPlayer(video);
  window.player.load(url).then(function () {
    video.play();
  });

  window.onbeforeunload = function () {
    window.player.dispose();
  };
});