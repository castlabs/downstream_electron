"use strict";

module.exports = function (api, onSuccess, onFailure, target, manifestId, representations) {
  api.downloadsController.start(manifestId, representations, onSuccess, onFailure, true);
};
