"use strict";

const Manifest = require("../../manifest/loader/manifest").Manifest;
const translation = require("../../translation/index");
const canCreateManifest = require("../../util/can-create-manifest");
const getInvalidDiff = require("../../util/get-invalid-diff");
const appSettings = require("../../app-settings");

module.exports = function (api, onSuccess, onFailure, target, manifestUrl, customManifestId, manifestStr) {
  var useCustomId = true;

  if (typeof customManifestId === "undefined" ||
    customManifestId === "" ||
    customManifestId === null) {
    useCustomId = false;
  }

  if (useCustomId) {
    if (typeof customManifestId !== "undefined" &&
      typeof customManifestId !== "number" &&
      typeof customManifestId !== "string") {
      onFailure(translation.getError(translation.e.manifests.INVALID_ID, customManifestId));
      return;
    }
    const customManifestIdFolderRegex = appSettings.getSettings().customManifestIdFolderRegex;

    if (!customManifestId.match(customManifestIdFolderRegex)) {
      const invalid = getInvalidDiff(
        customManifestId,
        customManifestIdFolderRegex,
        appSettings.getSettings().openingTagForInvalidCustomManifestIdCharacter,
        appSettings.getSettings().closingTagForInvalidCustomManifestIdCharacter);
      onFailure(translation.getError(translation.e.manifests.INVALID_ID, invalid));
      return;
    }
  }

  let manifest = new Manifest(customManifestId);
  let promise;
  if (manifestStr) {
    promise = manifest.loadWithManifest(manifestUrl, manifestStr)
  } else {
    promise = manifest.load(manifestUrl);
  }

  promise.then(() => {
    if (useCustomId) {
      canCreateManifest(customManifestId).then(function () {
        api.manifestController.cacheManifest(manifest);
        onSuccess(manifest.getJsonInfo());
      }, function (err) {
        onFailure(translation.getError(translation.e.manifests.FOLDER_ALREADY_EXISTS, customManifestId), err);
      });
    } else {
      api.manifestController.cacheManifest(manifest);
      onSuccess(manifest.getJsonInfo());
    }
  }, (err) => {
    onFailure(translation.getError(translation.e.manifests.LOADING_FAILED, manifestUrl), err);
  });
};
