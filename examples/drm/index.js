'use strict';

window.$ = window.jQuery = require('jquery');
const { remote } = require('electron');
const fs = require('fs');
const streamUrl = 'https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd';
const licenseUrl = 'https://cwip-shaka-proxy.appspot.com/no_auth';

const videoType = 'video/mp4;codecs="avc1.42c01e"';
const audioType = 'audio/mp4;codecs="mp4a.40.2"';

var manifestId;
var videoPath;
var audioPath;
var activeSession;

function _base64ToArrayBuffer(base64) {
  return _rawToArrayBuffer(atob(base64));
}

function _rawToArrayBuffer(raw) {
  var len = raw.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++)        {
      bytes[i] = raw.charCodeAt(i);
  }
  return bytes.buffer;
}

function _keySystemConfig() {
  var config = [{
    initDataTypes: ['cenc'],
    audioCapabilities: [{
      contentType: audioType,
      robustness: 'SW_SECURE_CRYPTO'
    }],
    persistentState: ['required'],
    sessionTypes: ['persistent-license'],
    videoCapabilities: [{
      contentType: videoType,
      robustness: 'SW_SECURE_CRYPTO'
    }]
  }];

  return config;
}

function _handleKeyStatusesChange(event) {
  event.target.keyStatuses.forEach(function(status, keyId) {
    switch (status) {
      case "usable":
        console.log('SESSION USABLE');
        break;
      case "expired":
        // Report an expired key.
        console.log('SESSION EXPIRED');
        break;
      case "status-pending":
        // The status is not yet known. Consider the key unusable until the status is updated.
        console.log('SESSION PENDING');
        break;
      default:
        // Do something with |keyId| and |status|.
    }
  })
}

function _createOrLoadMediaSession(resolve, pssh, session) {

  function _handleMessage(event) {
    console.log('message', event);
  
    var request = event.message;
    var xmlhttp = new XMLHttpRequest();
  
    xmlhttp.keySession = event.target;
    xmlhttp.open('POST', licenseUrl);
  
    xmlhttp.onload = function(e) {
      var license = xmlhttp.response;
      xmlhttp.keySession.update(license).catch(function (error) {
        console.log('update() failed', error);
      });
      resolve(xmlhttp.keySession.sessionId);
    }
  
    xmlhttp.responseType = "arraybuffer";
    xmlhttp.send(request);
  }

  function _startSession(mediaKeys) {
    var keySession = mediaKeys.createSession('persistent-license');
    activeSession = keySession;
    
    keySession.addEventListener('message', _handleMessage, false);
    keySession.addEventListener('keystatuseschange', _handleKeyStatusesChange, false);

    if (session != null) {
      keySession.load(session).then(
        function(loaded) {
          if (!loaded) {
            console.log('No stored session with the ID ' + session + ' was found.');
            // The application should remove its record of |sessionId|.
            return;
          }

          console.log('loaded');
          if (resolve) {
            resolve(session);
          }
        }
      );
    } else {
      return keySession.generateRequest('cenc', _base64ToArrayBuffer(pssh));
    }
  }

  navigator.requestMediaKeySystemAccess('com.widevine.alpha', _keySystemConfig()).then(
    function(keySystemAccess) {
      console.log('keySystemAccess', keySystemAccess, keySystemAccess.getConfiguration().sessionTypes);

      var video = document.querySelector('#videoOffline');
      if (video.mediaKeys) {
        return _startSession(video.mediaKeys);
      }

      var promise = keySystemAccess.createMediaKeys();
      promise.catch(
        console.error.bind(console, 'Unable to create MediaKeys')
      );

      promise.then(
        function(createdMediaKeys) {
          console.log('createdMediaKeys', createdMediaKeys);
          
          if (video.mediaKeys) {
            return video.mediaKeys;
          }
          return video.setMediaKeys(createdMediaKeys);
        }
      ).catch(
        console.error.bind(console, 'Unable to set MediaKeys')
      );

      promise.then(
        function(createdMediaKeys) {
          return _startSession(createdMediaKeys);
        }
      ).catch(
        console.error.bind(console,
          'Unable to create or initialize key session')
      );
    }
  );
}

function FakePersistentPlugin () {
  this.createPersistentSession = function (persistentConfig) {
    console.log('create - persistent plugin', persistentConfig);
    return new Promise(function (resolve) {
      _createOrLoadMediaSession(function(sessionId) {
        //activeSession.close();
        resolve(sessionId);
      }, persistentConfig.pssh, null);
    });
  };

  this.removePersistentSession = function (sessionId) {
    return new Promise(function (resolve) {
      if (activeSession !== undefined && activeSession !== null) {
        activeSession.remove();
      }
      console.log('remove - persistent plugin, sessionId', sessionId);
      resolve();
    });
  };
}

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
});

// TESTING PRODUCTION
let index = '../../index';
if (!fs.existsSync(index)) {
  //DEV
  index = '../../api/index';
}

const downstreamElectron = require(index).init(window, new FakePersistentPlugin());
const playerUrl = `file://${__dirname}/../../player/index.html`;
const persistentConfig = {};

function playVideo(link, offlineSessionId, playerUrl, config) {
  let playerWindow = new remote.BrowserWindow({
    width: 860,
    height: 600,
    show: true,
    resizable: true,
    webPreferences: {
      plugins: true,
      nodeIntegration: true
    }
  });

  playerWindow.loadURL(playerUrl);
  playerWindow.webContents.openDevTools();
  playerWindow.webContents.on('did-finish-load', function (evt, args) {
    playerWindow.webContents.send('startPlaybackStream', {
      url: link,
      configuration: config,
      offlineSessionId: offlineSessionId
    });
  });
}

function onDownloadProgress(err, stats) {
  console.log(stats, err);
}

function removeUI() {
  $('#videoOffline').attr('hidden', true);
  $('#play').remove();
  $('#remove').remove();
  $('#removeAll').remove();
  $('#offline').remove();

  var video = document.querySelector('#videoOffline');
  video.pause();
}

function onDownloadFinish(err, info) {
  console.log(info, err);

  $('#mainActions').append($('</br>'));
  $('#mainActions').append($('<input id="offline" style="margin-right: 5px" type="button" value="Play Offline">').on('click', function () {
    videoPath = info.manifest.files[0].localUrl;
    audioPath = info.manifest.files[1].localUrl;
  
    var ms = new MediaSource;
    var video = document.querySelector('#videoOffline');
  
    ms.addEventListener('sourceopen', function() {
      console.log('sourceopen');
    
      var videoSourceBuffer = ms.addSourceBuffer(videoType);
      videoSourceBuffer.appendBuffer(fs.readFileSync(videoPath).buffer);
  
      var audioSourceBuffer = ms.addSourceBuffer(audioType);
      audioSourceBuffer.appendBuffer(fs.readFileSync(audioPath).buffer);

      downstreamElectron.downloads.getOfflineLink(manifestId).then(function (result) {
        console.log(result);
  
        if (activeSession !== null) {
          var video = document.querySelector('#videoOffline');
          video.play();
        } else {
          _createOrLoadMediaSession(function(sessionId) {
            var video = document.querySelector('#videoOffline');
            video.play();
          }, null, result.persistent);
        }
  
      }, function (err) {
        console.log('play offline error', err);
      });
    });
    video.src = URL.createObjectURL(ms);
  }));

  $('#mainActions').append($('<input id="remove" style="margin-right: 5px" type="button" value="Remove">').on('click', function () {
    if (confirm('Do you really want to delete this download? - this cannot be undone')) {
      downstreamElectron.downloads.remove(manifestId).then(function () {
        removeUI();
        console.log('removed');
      }, function (err) {
        console.log('remove error', err);
      });
    }
  }));

  $('#mainActions').append($('<input id="removeAll" type="button" value="Remove All">').on('click', function () {
    if (confirm('Do you really want to remove all downloads? - this cannot be undone')) {
      downstreamElectron.downloads.removeAll().then(function () {
        removeUI();
        console.log('removed');
      }, function (err) {
        console.log('remove all error', err);
      });
    }
  }));

  $('#mainActions').append($('<input type="button" id="play" value="Play">').on('click', function () {
    playVideo(streamUrl, '', playerUrl, {
      drm: {
        servers: {
          'com.widevine.alpha': licenseUrl
        }
      }
    });
  }));

  $('#videoOffline').removeAttr('hidden'); 
}

function onSubmit(e) {
  e.preventDefault();
  let value = document.getElementById('manifestUrl').value;

  downstreamElectron.downloads.create(value, '').then(function (result) {
    console.log(result);
    manifestId = result.id;

   let representations = {
      video: [result.video[0].id],
      audio: [result.audio[0].id]
    };
    console.log(representations);

    downstreamElectron.downloads.createPersistent(result.id, persistentConfig).then(function (persistentSessionId) {
      console.log('persistent', persistentSessionId);
    }, function (err) {
      console.log('persistent error', err);
    });

    downstreamElectron.downloads.start(result.id, representations).then(function () {

      downstreamElectron.downloads.subscribe(result.id, 1000, onDownloadProgress, onDownloadFinish).then(function () {
        console.log('subscribed');
      }, function (err) {
        console.log('subscribed', err);
      });
    }, function (err) {
      console.log(result, err);
    });

  }, function (err) {
    console.log(result, err);
  });

  return false;
}

function addForm () {
  $("<form id='form'></form>").insertAfter($("#header"));
  $("#form").append($("<table style='width: 600px'><tr>"));
  $("#form").append($("<td><span style='margin-right: 5px'>Manifest Url</span></td>"));
  $("#form").append($("<td><input type='text' style='width: 400px; margin-right: 5px' id='manifestUrl' name='manifestUrl'></td>"));
  $("#form").append($("<td><input type='submit' name='submit' value='Download'></td>"));
  $("#form").append($("</tr></table>"));

  $('#manifestUrl').val(streamUrl);
}

function onLoad() {
  addForm();
  document.getElementById('form').addEventListener('submit', onSubmit);

  downstreamElectron.downloads.getListWithInfo().then(function (results) {
    console.log(results);

    for (let index = 0; index < results.length; ++index) {
      let result = results[index];
      if (result.status !== 'FINISHED') {
        continue;
      }

      if (result.manifest.url === streamUrl) {
        var info = result.manifestInfo;
        info.manifest = result.manifest;
        manifestId = info.id;
        activeSession = null;
        onDownloadFinish('', info);
        return;
      }
    }
  }, function (err) {
    console.log(err);
  });
}

$(document).ready(onLoad);
