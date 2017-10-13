"use strict";

const translation = require('../../translation/index');
const STATUSES = require("../../downloads/statuses");

module.exports = function (api, onSuccess, onFailure) {
  api.offlineController.getManifestsListWithInfo(function (err, results) {
    if (err) {
      onFailure(translation.getError(translation.e.downloads.STOPPING_ALL_FAILED), err);
    } else {
      let promises = [];
      let manifestIds = [];
      for (let i = 0, j = results.length; i < j; i++) {
        let status = results[i].status;
        let manifestId = results[i].manifestInfo.id;
        if (status !== STATUSES.FINISHED) {
          manifestIds.push(manifestId);
          promises.push(api.downloadsController.stopPromise(manifestId, true));
        }
      }
      if (manifestIds.length > 0) {
        Promise.all(promises)
            .then(function () {
              onSuccess(manifestIds);
            }, function (err) {
              onFailure(translation.getError(translation.e.downloads.STOPPING_ALL_FAILED), err);
            });
      } else {
        onFailure(translation.getError(translation.e.downloads.ALREADY_STOPPED_ALL));
      }
    }
  });
};
