const { ipcRenderer } = require('electron');
const ShakaPlayer = require('shaka-player').Player;

ipcRenderer.on('startPlaybackStream', (evt, args) => {
  var url = args.url;
  var configuration = args.configuration;
  var video = document.querySelector('#video');

  window.player = new ShakaPlayer(video);
  window.player.configure(configuration);
  window.player.load(url).then(function () {
    var promise = video.play();
    if (promise !== undefined) {
      promise.then(_ => {
        console.log('autoplay started');
      }).catch(error => {
        console.log('autoplay was prevented', error);
      });
    }
  });

  window.onbeforeunload = function () {
    window.player.dispose();
  };
});
