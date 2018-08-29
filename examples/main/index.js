'use strict';
window.$ = window.jQuery = require('jquery');
const { remote } = require('electron');

const fakePersistentSessionId = 'fake_';

// fake persistent plugin - needed for easier testing
function FakePersistentPlugin () {
  this.createPersistentSession = function (persistentConfig) {
    console.log('create - call of fake persistent plugin, persistentConfig', persistentConfig);
    return new Promise(function (resolve) {
      setTimeout(function () {
        const sessionId = fakePersistentSessionId + Math.random();
        console.log('create - call of fake persistent plugin resolved', sessionId);
        resolve(sessionId);
      }, 1000);
    });
  };
  this.removePersistentSession = function (sessionId) {
    console.log('remove - call of fake persistent plugin, sessionId', sessionId);
    return new Promise(function (resolve) {
      setTimeout(function () {
        console.log('remove - call of fake persistent plugin resolved', sessionId);
        resolve();
      }, 1000);
    });
  };
}

// DEV
const downstreamElectron = require('../../api/index').init(window, new FakePersistentPlugin());
// TESTING PRODUCTION
// const downstreamElectron = require('../../dist/index').init(window, new FakePersistentPlugin());

const playerUrl = `file://${__dirname}/../../player/index.html`;

const persistentConfig = {};

function showStatusOK(message, contentStatus) {
  contentStatus = contentStatus || '#contentStatus';
  message = new Date().toISOString().replace(/Z|T/g, ' ') + message + ' SUCCESS';
  $(contentStatus).html(message);
  $(contentStatus).removeClass('error');
  $(contentStatus).addClass('success');
  console.log(message);
}

function showStatusError(message, err, contentStatus) {
  contentStatus = contentStatus || '#contentStatus';
  message = new Date().toISOString().replace(/Z|T/g, ' ') + message + ' FAILED';
  $(contentStatus).html(message + '<br>' + (err ? JSON.stringify(err) : ''));
  $(contentStatus).removeClass('success');
  $(contentStatus).addClass('error');
  console.log(message, err);
}

function showStats(contentSubscribe, stats) {
  $(contentSubscribe).html('');
  for (let key in stats) {
    if (stats.hasOwnProperty(key)) {
      $(contentSubscribe).append($('<span class="progressItem">' +
        '<span class="key">' + key + ': </span>' +
        '<span class="stats">' + JSON.stringify(stats[key]) + '</span><' +
        '/span>'));
    }
  }
  const message = new Date().toISOString().replace(/Z|T/g, ' ') + stats.progressPercentage;
  console.log(message);
}

function getHeaderInfo(result) {
  let header = new Date(result.manifest.ts);
  header += '<br/>' + result.manifest.url;
  return header;
}

function getItemInfo(result) {
  let info = {};

  function getChosenRepresentations(userR, manifestR) {
    let hash = {};
    let chosenRepresentations = [];
    userR = userR || [];
    for (let i = 0, j = userR.length; i < j; i++) {
      hash[userR[i]] = true;
    }
    for (let i = 0, j = manifestR.length; i < j; i++) {
      if (hash[manifestR[i].id]) {
        chosenRepresentations.push(manifestR[i]);
      }
    }
    return chosenRepresentations;
  }

  info.status = result.status;
  info.details = result.details;
  info.data = result.data;
  info.downloaded = result.downloaded;
  info.persistent = result.persistent;
  info.left = result.left;
  info.errors = result.errors;
  info.video = getChosenRepresentations(result.manifest.video, result.manifestInfo.video);
  info.audio = getChosenRepresentations(result.manifest.audio, result.manifestInfo.audio);
  info.text = getChosenRepresentations(result.manifest.text, result.manifestInfo.text);
  info.files = result.manifest.totalFiles;
  let html = $('<ul type="disc"></ul>');
  for (let key in info) {
    if (info.hasOwnProperty(key)) {
      html.append($('<li>' + key + ': <span>' + JSON.stringify(info[key]) + '</span>' + '</li>'));
    }
  }
  // return JSON.stringify(result);
  return html;
}

function getItemFolderInfo(result) {
  let info = {};

  info.folder = result.folder;
  info.size = _convertToBytes(result.size, 1, 2, 2);
  let html = $('<ul type="disc"></ul>');
  for (let key in info) {
    if (info.hasOwnProperty(key)) {
      html.append($('<li>' + key + ': <span>' + JSON.stringify(info[key]) + '</span>' + '</li>'));
    }
  }
  // return JSON.stringify(result);
  return html;
}

function getContentName(contentMain) {
  return '#' + $(contentMain).attr('id').replace('Main', '');
}

function showInfo(info, container) {
  $(container).html(getItemInfo(info));
}

function showFolderInfo(info, container) {
  $(container).html(getItemFolderInfo(info))
}

function addStartActions(manifestId) {
  //START
  $('#contentActions').append($('<input type="button" value="Start">').on('click', function () {
    let representations = getSelectedRepresentations();
    let count = representations.video.length + representations.audio.length + representations.text.length;
    if (count > 0) {
      let customFolder = document.getElementById('customDownloadFolder').value;
      downstreamElectron.downloads.start(manifestId, representations, customFolder).then(function () {
        clearContent();
        showStatusOK('start');
        addItemActions(manifestId, '#contentActions', '#contentHeader', '#contentMain', '#contentSubscribe',
          '#contentStatus');
      }, function (err) {
        showStatusError('start', err);
      });
    } else {
      alert('Please choose representations first');
    }
  }));
  $('#contentActions').append($('<input type="button" value="Select Default">').on('click', function () {
    let checkBoxes = $('input[type="checkbox"]');
    let videos = checkBoxes.filter(function (i, checkBox) {return checkBox.name === 'video';});
    let rest = checkBoxes.filter(function (i, checkBox) {return checkBox.name !== 'video';});
    // sort as best in the beginning;
    videos.sort(function (a, b) {
      let valA = parseInt(a.getAttribute('data-bandwidth'), 10);
      let valB = parseInt(b.getAttribute('data-bandwidth'), 10);
      if (valA > valB) {
        return -1;
      } else if (valA < valB) {
        return 1;
      }
      return 0;
    });

    videos[videos.length - 1].checked = true;
    rest.each(function (i, element) {
      element.checked = true;
    });
  }));
  $('#contentActions').append($('<input type="button" value="Select All/ Deselect All">').on('click', function () {
    $('input[type="checkbox"]').each(function () {
      this.checked = !this.checked;
    });
  }));
  //Create Persistent Session
  $('#contentActions').append($('<input type="button" value="Create Persistent Session">').on('click', function () {
    downstreamElectron.downloads.createPersistent(manifestId, persistentConfig).then(function (persistentSessionId) {
      showStatusOK('Create Persistent Session: ' + persistentSessionId, contentStatus);
    }, function (err) {
      showStatusError('Create Persistent Session', err, contentStatus);
    });
  }));

  //Create Persistent Session - forced
  $('#contentActions').append($('<input type="button" value="Create Persistent Session - forced">').on('click', function () {
    downstreamElectron.downloads.createPersistent(manifestId, persistentConfig, true).then(function (persistentSessionId) {
      showStatusOK('Create Persistent Session - forced: ' + persistentSessionId, contentStatus);
    }, function (err) {
      showStatusError('Create Persistent Session - forced', err, contentStatus);
    });
  }));

  //Remove Persistent Session
  $('#contentActions').append($('<input type="button" value="Remove Persistent Session">').on('click', function () {
    downstreamElectron.downloads.removePersistent(manifestId).then(function (result) {
      showStatusOK('Remove Persistent Session', contentStatus);
    }, function (err) {
      showStatusError('Remove Persistent Session', err, contentStatus);
    });
  }));

  //Update download folder
  $('#contentActions').append($('<input type="button" value="Update Download Folder">').on('click', function () {
    const pathArray = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
    let path = pathArray ? pathArray[0] : undefined;
    if (path) {
      downstreamElectron.downloads.updateDownloadFolder(manifestId, path).then(function (result) {
        showStatusOK('Update Download Folder', contentStatus);
      }, function (err) {
        showStatusError('Update Download Folder', err, contentStatus);
      });
    } else {
      showStatusError('Update Download Folder', 'Choose a folder');
    }
  }));

  $('#contentActions').clone(true).appendTo($('#contentActions2'));
}

function checkForMissingSubscribers(contentSubscribe, manifestId) {
  if (!$(contentSubscribe).parents().length) {
    downstreamElectron.downloads.unsubscribe(manifestId).then(function () {
      showStatusOK('removing previous subscribers -> ' + manifestId);
    }, function (err) {
      showStatusError('removing previous subscribers -> ' + manifestId, err);
    });
    return true;
  }
}

function removeFadeOut(contentName) {
  $(contentName).parent().fadeOut(600, function () {
    let mainParent = $(contentName).parent().parent();
    $(contentName).parent().remove();
    updateListHeader(mainParent.children().length);
  });
}

function addItemActions(manifestId,
  contentActions,
  contentHeader,
  contentMain,
  contentSubscribe,
  contentStatus,
  contentHeaderInfo) {
  contentHeaderInfo = contentHeaderInfo || '';
  if (contentHeaderInfo) {
    contentHeaderInfo = ' -> ' + contentHeaderInfo;
  }
  $(contentHeader).html(manifestId + contentHeaderInfo);

  //SUBSCRIBE
  $(contentActions).append($('<input type="button" value="Subscribe">').on('click', function () {
    $(contentSubscribe).html('');

    function onProgress(err, stats) {
      if (checkForMissingSubscribers(contentSubscribe, manifestId)) {
        return;
      }
      showStats(contentSubscribe, stats);
    }

    function onFinish(err, info) {
      if (checkForMissingSubscribers(contentSubscribe, manifestId)) {
        return;
      }
      if (info.status === 'FINISHED') {
        showStatusOK('DOWNLOAD', contentStatus);
      } else if (info.status !== 'STOPPED') {
        showStatusError('DOWNLOAD', err, contentStatus);
      }
    }

    downstreamElectron.downloads.subscribe(manifestId, 1000, onProgress, onFinish).then(function () {
      showStatusOK('subscribe', contentStatus);
    }, function (err) {
      showStatusError('subscribe', err, contentStatus);
    });
  }));
  //UNSUBSCRIBE
  $(contentActions).append($('<input type="button" value="Unsubscribe">').on('click', function () {
    downstreamElectron.downloads.unsubscribe(manifestId).then(function (result) {
      showStatusOK('unsubscribe', contentStatus);
    }, function (err) {
      showStatusError('unsubscribe', err, contentStatus);
    });
  }));
  //STOP
  $(contentActions).append($('<input type="button" value="Stop">').on('click', function () {
    downstreamElectron.downloads.stop(manifestId).then(function () {
      showStatusOK('stop', contentStatus);
    }, function (err) {
      showStatusError('stop', err, contentStatus);
    });
  }));
  //RESUME
  $(contentActions).append($('<input type="button" value="Resume">').on('click', function () {
    downstreamElectron.downloads.resume(manifestId).then(function () {
      showStatusOK('resume', contentStatus);
    }, function (err) {
      showStatusError('resume', err, contentStatus);
    });
  }));
  //INFO
  $(contentActions).append($('<input type="button" value="Info">').on('click', function () {
    downstreamElectron.downloads.info(manifestId).then(function (result) {
      clearContent(getContentName(contentMain));
      showInfo(result, contentMain);
      addItemActions(manifestId, contentActions, contentHeader, contentMain, contentSubscribe, contentStatus,
        getHeaderInfo(result));
      showStatusOK('info', contentStatus);
    }, function (err) {
      showStatusError('info', err, contentStatus);
    });
  }));
  //FOLDER INFO
  $(contentActions).append($('<input type="button" value="Folder Info">').on('click', function () {
    downstreamElectron.downloads.getFolderInfo(manifestId).then(function (result) {
      clearContent(getContentName(contentMain));
      showFolderInfo(result, contentMain);
      downstreamElectron.downloads.info(manifestId).then(function (result) {
        addItemActions(manifestId, contentActions, contentHeader, contentMain, contentSubscribe, contentStatus,
                       getHeaderInfo(result));
        showStatusOK('folderInfo', contentStatus);
      }, function (err) {
        showStatusError('info', err, contentStatus);
      });
    }, function (err) {
      showStatusError('folderInfo', err, contentStatus);
    });
  }));
  //PLAY
  $(contentActions).append($('<input type="button" value="PLAY">').on('click', function () {
    downstreamElectron.downloads.getOfflineLink(manifestId).then(function (result) {
      playVideo(result.offlineLink, result.persistent, playerUrl);
      showStatusOK('play', contentStatus);
    }, function (err) {
      showStatusError('play', err, contentStatus);
    });
  }));
  //REMOVE
  $(contentActions).append($('<input type="button" value="Remove">').on('click', function () {
    if (confirm('Do you really want to delete this download? - this cannot be undone')) {
      downstreamElectron.downloads.remove(manifestId).then(function () {
        showStatusOK('remove -> ', contentStatus);
        if (getContentName(contentMain) === '#' + manifestId) {
          removeFadeOut(contentMain);
        } else {
          clearContent(getContentName(contentMain));
        }
        showStatusOK('remove -> ' + manifestId);
      }, function (err) {
        showStatusError('remove -> ' + manifestId, err, contentStatus);
      });
    }
  }));

  //Create Persistent Session
  $(contentActions).append($('<input type="button" value="Create Persistent Session">').on('click', function () {
    downstreamElectron.downloads.createPersistent(manifestId, persistentConfig).then(function (persistentSessionId) {
      showStatusOK('Create Persistent Session: ' + persistentSessionId, contentStatus);
    }, function (err) {
      showStatusError('Create Persistent Session', err, contentStatus);
    });
  }));

  //Create Persistent Session - forced
  $(contentActions).append($('<input type="button" value="Create Persistent Session - forced">').on('click', function () {
    downstreamElectron.downloads.createPersistent(manifestId, persistentConfig, true).then(function (persistentSessionId) {
      showStatusOK('Create Persistent Session - forced: ' + persistentSessionId, contentStatus);
    }, function (err) {
      showStatusError('Create Persistent Session - forced', err, contentStatus);
    });
  }));

  //Remove Persistent Session
  $(contentActions).append($('<input type="button" value="Remove Persistent Session">').on('click', function () {
    downstreamElectron.downloads.removePersistent(manifestId).then(function (result) {
      showStatusOK('Remove Persistent Session', contentStatus);
    }, function (err) {
      showStatusError('Remove Persistent Session', err, contentStatus);
    });
  }));

  //Update download folder
  $(contentActions).append($('<input type="button" value="Update Download Folder">').on('click', function () {
    const pathArray = remote.dialog.showOpenDialog({ properties: ['openDirectory'] });
    let path = pathArray ? pathArray[0] : undefined;
    if (path) {
      downstreamElectron.downloads.updateDownloadFolder(manifestId, path).then(function (result) {
        showStatusOK('Update Download Folder', contentStatus);
      }, function (err) {
        showStatusError('Update Download Folder', err, contentStatus);
      });
    } else {
      showStatusError('Update Download Folder', 'Choose a folder');
    }
  }));

}

function playVideo(link, offlineSessionId, playerUrl) {
  let playerWindow = new remote.BrowserWindow({
    width: 860,
    height: 600,
    show: true,
    resizable: true,
    webPreferences: {
      plugins: true
    }
  });
  playerWindow.loadURL(playerUrl);
  playerWindow.webContents.openDevTools();
  playerWindow.webContents.on('did-finish-load', function (evt, args) {
    playerWindow.webContents.send('startPlaybackStream', {
      url: link,
      offlineSessionId: offlineSessionId
    });
  });
}

function getSelectedRepresentations() {
  let representations = {};
  representations.video = [];
  $('input[type="checkbox"][name="video"]:checked').each(function () {
    representations.video.push($(this).attr('value'));
  });
  representations.audio = [];
  $('input[type="checkbox"][name="audio"]:checked').each(function () {
    representations.audio.push($(this).attr('value'));
  });
  representations.text = [];
  $('input[type="checkbox"][name="text"]:checked').each(function () {
    representations.text.push($(this).attr('value'));
  });
  return representations;
}

function createCheckBoxes(items, name) {
  function getBandwidth(item) {
    return item.bandwidth;
  }

  function getValue(item) {
    return item.id;
  }

  function getDescription(item) {
    let description = '';
    for (let key in item) {
      if (item.hasOwnProperty(key)) {
        description += '(' + key + ': ' + item[key] + ')';
      }
    }
    return description;
  }

  function createElement(item) {
    return $('<label style="display:block;"><input type="checkbox" data-bandwidth="' + getBandwidth(
      item) + '" name="' + name + '" value="' + getValue(item) + '" > ' + getDescription(item) + ' </label>');
  }

  $('#contentMain').append('<h3>' + name + '</h3>');
  for (let i = 0, j = items.length; i < j; i++) {
    $('#contentMain').append(createElement(items[i]));
  }
}

function addDownloadItem(result, container) {
  let manifestId = result.manifestInfo.id;
  let contentHeader = $('<h4 id="' + manifestId + 'Header" class="header"></h4>');
  let contentActions = $('<div id="' + manifestId + 'Actions" class="actions"></div>');
  let contentStatus = $('<div id="' + manifestId + 'Status" class="status"></div>');
  let contentSubscribe = $('<div id="' + manifestId + 'Subscribe" class="subscribe"></div>');
  let contentMain = $('<div id="' + manifestId + 'Main" class="main"></div>');

  contentHeader.html(manifestId);
  contentMain.html(getItemInfo(result));
  addItemActions(manifestId, contentActions, contentHeader, contentMain, contentSubscribe, contentStatus,
    getHeaderInfo(result));
  let li = $('<li></li>');
  $(li).append(contentHeader);
  $(li).append(contentActions);
  $(li).append(contentStatus);
  $(li).append(contentSubscribe);
  $(li).append(contentMain);

  $(container).append(li);
}

function addDownloadsList(results) {
  results.sort(function (a, b) {
    if (a.manifest.ts > b.manifest.ts) {
      return -1;
    } else if (a.manifest.ts < b.manifest.ts) {
      return 1;
    } else {
      return 0;
    }
  });
  let list = $('<ol></ol>');

  for (let i = 0, j = results.length; i < j; i++) {
    addDownloadItem(results[i], list);
  }
  $('#contentMain').append(list);
}

function onRemoveAllUnfinished(results) {
  for (let i = 0, j = results.length; i < j; i++) {
    let contentMain = '#' + results[i] + 'Main';
    removeFadeOut(contentMain);
  }
}

function updateListHeader(numberOfItems) {
  $('#contentHeader').html('Showing available downloads -> ' + numberOfItems);
}

function addMainActions() {
  //GET ALL
  $('#mainActions').append($('<input type="button" value="getList">').on('click', function () {
    clearContent();
    downstreamElectron.downloads.getListWithInfo().then(function (results) {
      clearContent();
      showStatusOK('getListWithInfo');
      updateListHeader(results.length);
      addDownloadsList(results);
    }, function (err) {
      clearContent();
      showStatusError('getListWithInfo', err);
    });
  }));
  //STOP ALL
  $('#mainActions').append($('<input type="button" value="stopAll">').on('click', function () {
    if (confirm('Do you really want to stop all unfinished downloads?')) {
      downstreamElectron.downloads.stopAll().then(function (results) {
        showStatusOK('stopAll');
      }, function (err) {
        showStatusError('stopAll', err);
      });
    }
  }));
  //REMOVE ALL
  $('#mainActions').append($('<input type="button" value="removeAll">').on('click', function () {
    if (confirm('Do you really want to remove all downloads? - this cannot be undone')) {
      clearContent();
      downstreamElectron.downloads.removeAll().then(function () {
        clearContent();
        showStatusOK('removeAll');
      }, function (err) {
        clearContent();
        showStatusError('removeAll', err);
      });
    }
  }));
  //REMOVE ALL UNFINISHED
  $('#mainActions').append($('<input type="button" value="removeAllUnfinished">').on('click', function () {
    if (confirm('Do you really want to remove all unfinished downloads? - this cannot be undone')) {
      downstreamElectron.downloads.removeAllUnfinished().then(function (results) {
        showStatusOK('removeAllUnfinished');
        onRemoveAllUnfinished(results);
      }, function (err) {
        clearContent();
        showStatusError('removeAllUnfinished', err);
      });
    }
  }));

  addStressTest();
}

function addStressTest() {
  let manifests = [];
  for (let i = 0, j = 10; i < j; i++) {
    manifests.push('http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd');
    manifests.push('http://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd');
  }

  let container = $('#stress');
  if (!container[0]) {
    container = $('<div></div>');
    $('#mainActions').after(container);
  }

  function showStatsStress(manifestId, contentSubscribe, stats) {
    $(contentSubscribe).html('');
    $(contentSubscribe).append(manifestId + ' -> ');

    function showStat(key) {
      $(contentSubscribe).append(key + ': ');
      $(contentSubscribe).append(stats[key]);
    }

    showStat('progressPercentage');
    showStat('speedBytes');
  }

  function onStart(manifestId, itemContainer) {
    function onProgress(err, stats) {
      showStatsStress(manifestId, itemContainer, stats);
    }

    function onFinish(err, info) {
      if (info.status === 'FINISHED') {
        showStatusOK('DOWNLOAD ' + manifestId, itemContainer);
      } else if (info.status !== 'STOPPED') {
        showStatusError('DOWNLOAD ' + manifestId, err, itemContainer);
      }
    }

    downstreamElectron.downloads.subscribe(manifestId, 1000, onProgress, onFinish).then(function () {
      showStatusOK('subscribe', itemContainer);
    }, function (err) {
      showStatusError('subscribe', err, itemContainer);
    });
  }

  function start(url) {
    let itemContainer = $('<div></div>');
    container.append(itemContainer);
    return new Promise(function (resolve, reject) {

      downstreamElectron.downloads.create(url).then(function (result) {
        let manifestId = result.id;
        result.video.sort(function (item1, item2) {
          let val1 = parseInt(item1.bandwidth, 10);
          let val2 = parseInt(item2.bandwidth, 10);
          if (val1 > val2) {
            return 1;
          } else if (val1 < val2) {
            return -1;
          }
          return 0;
        });

        let video = result.video.map(function (item) {return item.id;});
        let audio = result.audio.map(function (item) {return item.id;});
        let text = result.text.map(function (item) {return item.id;});

        // leave only one representation
        video.splice(1);

        let customFolder = document.getElementById('customDownloadFolder').value;
        downstreamElectron.downloads.start(manifestId, { video: video, audio: audio, text: text }, customFolder).then(function () {
          onStart(manifestId, itemContainer);
          resolve(manifestId);
        }, function (err) {
          reject(manifestId);
          console.log(err);
        });
      }, function (err) {
        console.log(err);
      });
    });
  }

  function subscribeAll(manifestIds) {
    function onProgress(err, stats) {
      let speed = stats.reduce(function (a, b) {
        return a + b.speed;
      }, 0);
      speed = speed / (1024 * 1024);
      console.log(speed.toFixed(2) + 'MB');
    }

    function onFinish(err, infos) {
      console.log('finished', infos);
    }

    downstreamElectron.downloads.subscribe(manifestIds, 1000, onProgress, onFinish);
  }

  $('#mainActions').append($('<input type="button" value="stress start">').on('click', function () {
    let i, j, items = [];
    for (i = 0, j = manifests.length; i < j; i++) {
      items.push(start(manifests[i]));
    }
    Promise.all(items).then(function (manifestIds) {
      subscribeAll(manifestIds);
    });
  }));

  $('#mainActions').append($('<input type="button" value="stress stop">').on('click', function () {
    downstreamElectron.downloads.stopAll().then(function () {
      container.append('stopped');
    }, function () {
      container.append('already stopped');
    });
  }));

  $('#mainActions').append($('<input type="button" value="stress resume all">').on('click', function () {
    downstreamElectron.downloads.getListWithInfo().then(function (results) {
      results = results.filter(function (result) {
        return result.status !== 'FINISHED';
      });

      let manifestIds = results.map(function (result) {
        return result.manifestInfo.id;
      });

      function resume(manifestId) {
        return new Promise(function (resolve, reject) {
          downstreamElectron.downloads.resume(manifestId).then(function () {
            let itemContainer = $('<div></div>');
            container.append(itemContainer);
            onStart(manifestId, itemContainer);
            resolve(manifestId);
          }, function (err) {
            if (err.code === 17) {
              let itemContainer = $('<div></div>');
              container.append(itemContainer);
              onStart(manifestId, itemContainer);
            }
            resolve(manifestId);
          });
        });
      }

      container.html('');

      let items = [];
      for (let i = 0, j = manifestIds.length; i < j; i++) {
        items.push(resume(manifestIds[i]));
      }
      Promise.all(items).then(function () {
        subscribeAll(manifestIds);
      }, function () {
        console.log('error when resuming');
      });
    }, function (err) {
      showStatusError('resumeAll', err);
    });
  }));

  $('#mainActions').append($('<input type="button" value="stress clear">').on('click', function () {
    container.html('');
  }));
}

function clearContent(name) {
  name = name || '#content';
  const contentMain = name + 'Main';
  const contentActions = name + 'Actions';
  const contentActions2 = name + 'Actions2';
  const contentHeader = name + 'Header';
  const contentStatus = name + 'Status';
  const contentSubscribe = name + 'Subscribe';
  $(contentMain).html('');
  $(contentActions).html('');
  $(contentActions2).html('');
  $(contentHeader).html('');
  $(contentStatus).html('');
  $(contentSubscribe).html('');
}

function _convertToKB (value, precision) {
  precision = typeof precision !== "undefined" ? precision : 0;
  const a = Math.pow(10, precision);
  const oneKB = 1024;
  return (Math.round((value * a) / oneKB) / a) + "kB";
};

function _convertToMB (value, precision) {
  precision = typeof precision !== "undefined" ? precision : 0;
  const a = Math.pow(10, precision);
  const oneMB = 1024 * 1024;
  return (Math.round((value * a) / oneMB) / a) + "MB";
};

function _convertToGB (value, precision) {
  precision = typeof precision !== "undefined" ? precision : 0;
  const a = Math.pow(10, precision);
  const oneGB = 1024 * 1024 * 1024;
  return (Math.round((value * a) / oneGB) / a) + "GB";
};

function _convertToBytes (value, precision, precision2, precision3) {
  precision2 = typeof precision2 !== "undefined" ? precision2 : precision;
  precision3 = typeof precision3 !== "undefined" ? precision3 : precision;
  if (value < 100000) {
    return _convertToKB(value, precision)
  } else if (value < 1024 * 1024 * 1024) {
    return _convertToMB(value, precision2)
  } else {
    return _convertToGB(value, precision3)
  }
};

function onSubmit(e) {
  e.preventDefault();
  let value = document.getElementById('manifestUrl').value;
  let customManifestId = document.getElementById('customManifestId').value;
  clearContent();
  downstreamElectron.downloads.create(value, customManifestId).then(function (result) {
    showStatusOK('create');
    $('#contentHeader').html(result.id);
    createCheckBoxes(result.video, 'video');
    createCheckBoxes(result.audio, 'audio');
    createCheckBoxes(result.text, 'text');
    addStartActions(result.id);
  }, function (err) {
    showStatusError('create', err);
  });
  return false;
}

function onLoad() {
  document.getElementById('form').addEventListener('submit', onSubmit);
  addMainActions();
}

$(document).ready(onLoad);
