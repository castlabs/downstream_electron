"use strict";

module.exports = function (api, onSuccess, onFailure, target, manifestId, representations) {
  api.downloadsController.resume(manifestId, representations, onSuccess, onFailure);
};
