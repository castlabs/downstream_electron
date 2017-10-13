"use strict";
const STATUSES = require("../../downloads/statuses");
const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure, target, manifestId) {
  api.offlineController.getManifestInfo(manifestId, function (err, info) {
    if (err) {
      onFailure(translation.getError(translation.e.downloads._GENERAL), err);
    } else {
      if (info.status === STATUSES.FINISHED) {
        onSuccess({
          offlineLink: api.getOfflinePath(manifestId) + info.manifest.name,
          persistent: info.persistent
        });
      } else {
        onFailure(translation.getError(translation.e.downloads.UNFINISHED, manifestId), err);
      }
    }
  });
};
