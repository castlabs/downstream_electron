"use strict";

const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure, target, full) {
  api.offlineController.getManifestsListWithInfo(function (err, list) {
    if (err) {
      onFailure(translation.getError(translation.e.manifests.LIST_LOADING_FAILED), err);
    } else {
      onSuccess(list);
    }
  }, full);
};
