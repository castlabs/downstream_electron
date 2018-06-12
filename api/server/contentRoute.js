"use strict";

const appSettings = require("../app-settings");

 /**
 * ContentRoute
 * @param {object} app - express server instance
 * @constructor
 */

function ContentRoute (app, offlineController) {

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
      res.sendFile(file, options, function (err) {
        if (err && err.status) {
          res.status(err.status).end();
        }
      });
    });
  });
}

module.exports = ContentRoute;
