"use strict";
const fs = require('fs');

let _promiseCounter = 0;
let _promisesObj = {};

function _generateRequestId () {
  let ts = new Date().getTime();
  let requestId;
  _promiseCounter++;
  requestId = _promiseCounter + '-' + ts;
  return requestId;
}

function processCmd (cmd, args) {
  const requestId = _generateRequestId();
  const promise = new Promise(function (resolve, reject) {
    _promisesObj[requestId] = {
      resolve: resolve,
      reject: reject
    };
  });
  let request = {};
  request.requestId = requestId;
  request.cmd = cmd;
  request.args = args;
  process.send(request);
  return promise;
}

function processMessage (data) {
  const requestId = data.requestId;
  const error = data.error;
  const result = data.result;
  const promiseObj = _promisesObj[requestId + ''];

  function resolve (result) {
    promiseObj.resolve(result);
  }

  if (promiseObj) {
    if (data.status === 'OK') {
      resolve(result);
    } else {
      promiseObj.reject(error);
    }
    delete(_promisesObj[requestId]);
  }
}

/**
 *
 * @private
 * @returns {void}
 */
function _attachEvents () {
  process.on('message', processMessage);
}

/**
* ContentRoute
* @param {object} app - express server instance
* @constructor
*/

function ContentRoute (app, routeName) {

  let manifestFolderPath = {};

  _attachEvents();

  /*------------------------------------------------------------------------------------------*/

  // ROUTER MANAGEMENT

  /*------------------------------------------------------------------------------------------*/

  /**
   * Handles get movies/manifestId
   */
  app.get('/' + routeName + '/:id/*', function (req, res) {

    let manifestId = req.params['id'];

    // send back file data function
    let sendFile = function (file) {
      var options = {
        dotfiles: 'deny'
      }
      res.sendFile(file, options, function (err) {
        if (err && err.status) {
          // error to open file => remove saved folder (maybe moved)
          delete  manifestFolderPath[manifestId];
          res.status(err.status).end();
        }
      })
    }

    let seekIfNeeded  = function (folder) {
      let file = folder + '/' + manifestId + '/' + req.params[0];
      fs.exists(file, (exists) => {
        if (exists) {
          // no cached folder for manifest id, asks main process for folder
          processCmd('is_downloading', {manifest: manifestId, file: file})
          .then(() => {
            sendFile(file)
          })
          .catch(function () {
            return res.status(404).end();
          });
        } else {
           // ask to perform seek
          processCmd('perform_seek', {manifest: manifestId, file: file})
          .then(() => {
            sendFile(file)
          })
            .catch(function () {
            return res.status(404).end();
          });
        }
      })
    }

    // check if a folder has been already saved for the manifest
    if (manifestFolderPath[manifestId]) {
      seekIfNeeded(manifestFolderPath[manifestId]);
    } else {
      // no cached folder for manifest id, asks main process for folder
      processCmd('get_folder', {manifest: manifestId})
      .then((result) => {
        let downloadFolder = result.folder;
        // save folder location for manifest and then send file
        manifestFolderPath[manifestId] = downloadFolder;
        seekIfNeeded(manifestFolderPath[manifestId]);
      })
      .catch(function () {
        delete  manifestFolderPath[manifestId];
        return res.status(404).send('Cannot find manifest');
      });
    }
  })
}

module.exports = ContentRoute;
