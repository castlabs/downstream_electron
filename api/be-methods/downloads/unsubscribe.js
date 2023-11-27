"use strict";

const translation = require('../../translation/index');

module.exports = function (api, onSuccess, onFailure, target, manifestIds) {
  if (typeof manifestIds === 'string') {
    unsubscribeSingle(api, onSuccess, onFailure, target, manifestIds);
  } else {
    api.subscribersController.unsubscribe(manifestIds);
    api.subscribersController.unsubscribe(manifestIds.sort().join(','));
  }
};

function unsubscribeSingle (api, onSuccess, onFailure, target, manifestId) {
  const manifest = api.manifestController.getManifestById(manifestId);
  if (manifest) {
    api.subscribersController.unsubscribe(manifestId);
    onSuccess();
  } else {
    onFailure(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
  }
}
