"use strict";

module.exports = function (api, onSuccess, onFailure, target, manifestId, downloadFolder) {
  api.downloadsController.updateDownloadFolder(manifestId, downloadFolder, onSuccess, onFailure);
};
