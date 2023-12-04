window.utilsAPI.receive('utilsAPI', (event, message, args) => {
  if (message === 'startPlaybackStream') {
    var url = args.url;
    var configuration = args.configuration;
    var video = document.querySelector('#video');

    var player = new shaka.Player();
    window.player = player;

    player.attach(video);
    player.configure(configuration);
    player.load(url).then(function () {
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
  }
});
