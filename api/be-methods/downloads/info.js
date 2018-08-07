"use strict";

const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure, target, manifestId, full) {
  api.offlineController.getManifestInfo(manifestId, function (err, info) {
    if (err) {
      onFailure(translation.getError(translation.e.manifests.INFO_FAILED, manifestId), err);
    } else {
      onSuccess(info);
    }
  }, full);
};
