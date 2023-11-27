"use strict";

const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure) {
  api.offlineController.getManifestsList(function (err, list) {
    if (err) {
      onFailure(translation.getError(translation.e.manifests.LIST_LOADING_FAILED), err);
    } else {
      onSuccess(list);
    }
  });
};
