"use strict";

module.exports = function (api, onSuccess, onFailure, target, manifestId) {
  api.downloadsController.stop(manifestId, onSuccess, onFailure);
};
