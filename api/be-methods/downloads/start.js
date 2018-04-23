"use strict";

const translation = require("../../translation/index");
const canCreateManifest = require("../../util/can-create-manifest");

module.exports = function (api, onSuccess, onFailure, target, manifestId, representations) {
  const manifest = api.manifestController.getManifestById(manifestId);
  if (!manifest) {
    onFailure(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
    return;
  }

  api.downloadsController.storage.getItem(manifestId).then(function (result) {
    if (result) {
      onFailure(translation.getError(translation.e.downloads.ALREADY_STARTED, manifestId));
    } else {
      api.downloadsController.start(manifestId, representations, onSuccess, function (err) {
        onFailure(translation.getError(translation.e.downloads._GENERAL), err);
      });
    }
  }, function (err) {
    onFailure(translation.getError(translation.e.downloads._GENERAL), err);
  });

};
