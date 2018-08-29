"use strict";

const appSettings = require("../app-settings");
const fs = require('fs');
 /**
 * ContentRoute
 * @param {object} app - express server instance
 * @constructor
 */

function ContentRoute (app, offlineController, downloadController) {

  /*------------------------------------------------------------------------------------------*/

  // ROUTER MANAGEMENT

  /*------------------------------------------------------------------------------------------*/

  let routeName = appSettings.getSettings().downloadsName;
  /**
   * Handles get movies/manifestId
   */
  app.get('/' + routeName + '/:id/*', function (req, res) {

    let manifestId = req.params['id'];
    offlineController.getManifestInfo(manifestId, function (err, info) {
      if (err) {
        return res.status(404).send('Cannot find manifest');
      }

      let downloadFolder = info.manifest.folder;
      if (!downloadFolder) {
        // try to serve from default download folder
        downloadFolder = appSettings.getSettings().downloadsFolderPath
      }

      var options = {
        dotfiles: 'deny'
      };

      let file = downloadFolder + '/' + manifestId + '/' + req.params[0];

      let downloadedCallback = function (err) {
        if (err) {
          return res.status(404).end();
        }

        // no error => file has been downloaded
        res.sendFile(file, options, function (err) {
          if (err && err.status) {
            res.status(err.status).end();
          }
        });
      }

      // check if file exists
      fs.exists(file, (exists) => {
        if (exists) {
          // let's check that file is not being downloading
          let download = downloadController.getDownloading(manifestId, file);
          if (download) {
            // file is created but being downloading => wait for download before sending result
            downloadController.waitForDownload(download, downloadedCallback);
          } else {
            res.sendFile(file, options, function (err) {
              if (err && err.status) {
                res.status(err.status).end();
              }
            });
          }
        } else {
          // let's check if file is goigin to be downloaded => if so let's perform seek and send file once downloaded
          downloadController.performSeek(manifestId, file, downloadedCallback);
        }
      })
    });
  });
}

module.exports = ContentRoute;
