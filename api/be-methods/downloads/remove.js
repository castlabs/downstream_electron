"use strict";

const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure, target, manifestId) {
  api.offlineController.getManifestInfo(manifestId, function (err, info) {
    api.downloadsController.removePromise(manifestId)
        .then(function () {
          api.offlineController.removePromise(manifestId)
              .then(function () {
                api.subscribersController.unsubscribe(manifestId);
                api.manifestController.removeFromCache(manifestId);
                onSuccess(info);
              }, function (err) {
                onFailure(translation.getError(translation.e.downloads.REMOVING_FAILED, manifestId), err);
              });
        }, function (err) {
          onFailure(translation.getError(translation.e.downloads.REMOVING_FAILED, manifestId), err);
        });
  });
};
