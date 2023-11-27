"use strict";
const appSettings = window.require("../../app-settings");
const translation = window.require("../../translation/index");
const FlushItem = window.require("../../downloads/flush-item");

module.exports = function (api, onSuccess, onFailure, target, manifestId, data) {
  api.offlineController.getManifestInfo(manifestId, function (err) {
    if (err) {
      onFailure(translation.getError(translation.e.manifests.NOT_FOUND, manifestId), err);
    } else {
      const flushItem = new FlushItem(manifestId, appSettings.getSettings().stores.DATA, data);
      flushItem.save()
        .then(function () {
          onSuccess();
        }, function (err) {
          onFailure(translation.getError(translation.e.downloads.SAVING_DATA_FAILED, manifestId), err);
        });
    }
  });

};
