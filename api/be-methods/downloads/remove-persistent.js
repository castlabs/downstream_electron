"use strict";
const appSettings = require('../../app-settings');
const translation = require('../../translation/index');
const removeDir = require("../../util/remove-dir");

module.exports = function (api, onSuccess, onFailure, target, manifestId) {
  api.offlineController.getManifestInfo(manifestId, function (err, info) {
    if (err) {
      onFailure(translation.getError(translation.e.manifests.NOT_FOUND, manifestId), err);
    } else {
      const file = appSettings.getSettings().settingsFolder + manifestId + "/" + appSettings.getSettings().stores.PERSISTENT + ".json";

      removeDir(file, function (err) {
        if (err && err.code !== "ENOENT") {
          onFailure(translation.getError(translation.e.downloads.REMOVING_PERSISTENT_FAILED, manifestId), err);
        } else {
          onSuccess(info);
        }
      });
    }
  });

};
