"use strict";
const translation = require('../../translation/index');
const STATUSES = require("../../downloads/statuses");

module.exports = function (api, onSuccess, onFailure) {
  api.offlineController.getManifestsListWithInfo(function (err, results) {
    if (err) {
      onFailure(translation.getError(translation.e.downloads.REMOVING_ALL_UNFINISHED_FAILED), err);
    } else {
      let promises = [];
      let manifestIds = [];
      if (!results.length) {
        onFailure(translation.getError(translation.e.downloads.ALREADY_REMOVED_ALL_UNFINISHED));
        return;
      }
      for (let i = 0, j = results.length; i < j; i++) {
        let status = results[i].status;
        let manifestId = results[i].manifestInfo.id;
        if (status !== STATUSES.FINISHED) {
          manifestIds.push(manifestId);
          promises.push(api.downloadsController.removePromise(manifestId))
        }
      }
      Promise.all(promises)
        .then(function () {
          let promises = [];
          for (let i = 0, j = manifestIds.length; i < j; i++) {
            promises.push(api.offlineController.removePromise(manifestIds[i]));
          }
          Promise.all(promises)
            .then(function () {
              api.subscribersController.unsubscribe(manifestIds);
              api.manifestController.removeFromCache(manifestIds);
              onSuccess(manifestIds);
            }, function (err) {
              onFailure(translation.getError(translation.e.downloads.REMOVING_ALL_UNFINISHED_FAILED), err);
            });
        }, function (err) {
          onFailure(translation.getError(translation.e.downloads.REMOVING_ALL_UNFINISHED_FAILED), err);
        });
    }
  });
};
