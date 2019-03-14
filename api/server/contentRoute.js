"use strict";

const fs = require("fs");

function exists (fileUrl, callback) {
  fs.stat(fileUrl, function (error, stat) {
    if (error) {
      callback(false)
    } else {
      callback(true, stat.size);
    }
  });
}

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

  let manifestInfo = {};

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
          // error to open file => remove saved info (maybe moved)
          delete manifestInfo[manifestId];
          res.status(err.status).end();
        }
      })
    }

    let seekIfNeeded  = function (folder) {
      let file = folder + '/' + manifestId + '/' + req.params[0];
      exists(file, (exists) => {
        if (exists) {
          // fragment exists on disk, let's check if it is not being downloaded
          processCmd('is_downloading', {manifest: manifestId, file: file})
            .then(() => {
            sendFile(file)
          })
            .catch(function () {
            return res.status(404).end();
          });
        } else {
          // fragment doesn't on disk, ask to download it
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

    let getFile = function (info) {
      if (info && info.status === 'FINISHED') {
        // if file has status finished, no need to check if fragment is being downloaded
        let file = info.folder + '/' + manifestId + '/' + req.params[0];
        exists(file, (exists) => {
          if (exists) {
            // fragment exists => send data
            sendFile(file)
          } else {
            // fragment doesn't exists => 404 and remove cached data
            delete  manifestInfo[manifestId];
            return res.status(404).end();
          }
        });
      } else {
        // file is not finished, let's perform seek if needed
        seekIfNeeded( info.folder);
      }
    }

    // check if info have been already saved for the manifest
    if (manifestInfo[manifestId]) {
      getFile( manifestInfo[manifestId]);
    } else {
      // no info for manifest id, asks main process to get manifest info
      processCmd('get_info', {manifest: manifestId})
        .then((result) => {
        manifestInfo[manifestId] = result;
        getFile( manifestInfo[manifestId]);
      })
        .catch(function () {
        delete  manifestInfo[manifestId];
        return res.status(404).send('Cannot find manifest');
      });
    }
  })
}

module.exports = ContentRoute;
