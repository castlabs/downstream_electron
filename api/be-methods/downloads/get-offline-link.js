"use strict";
const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure, target, manifestId) {
  api.offlineController.getManifestInfo(manifestId, function (err, info) {
    if (err) {
      onFailure(translation.getError(translation.e.downloads._GENERAL), err);
    } else {
      onSuccess({
        offlineLink: api.getOfflinePath(manifestId) + info.manifest.name,
        persistent: info.persistent
      });
    }
  });
};
