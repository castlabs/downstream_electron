"use strict";

const translation = window.require("../../translation/index");
const Subscriber = window.require("../../util/subscriber");

module.exports = function (api, onSuccess, onFailure, target, manifestIds, timeout) {
  if (typeof manifestIds === 'string') {
    subscribeSingle(api, onSuccess, onFailure, target, manifestIds, timeout);
  } else {
    subscribeMany(api, onSuccess, onFailure, target, manifestIds, timeout);
  }
};

function subscribeMany (api, onSuccess, onFailure, target, manifestIds, timeout) {
  let subscriber1, subscriber2, subscribersId;
  const manifestId = manifestIds.sort().join(',');

  subscribersId = [];
  // callbackOnProgress
  subscriber1 = new Subscriber(function () {
    return api.downloadsController.downloadStats.getStats(manifestIds);
  }, api.processSubscriber, target, manifestId, timeout);
  subscribersId.push(api.subscribersController.addSubscriber(subscriber1));

  // callbackOnFinish
  subscriber2 = new Subscriber(function () {
    let result = true;
    for (let i = 0, j = manifestIds.length; i < j; i++) {
      result = result && api.downloadsController.isDownloadFinishedAndSynced(manifestIds[i]);
    }
    return result;
  }, api.processSubscriber, target, manifestId, timeout, true);

  subscriber2.onFinish(function (callback) {
    subscriber1.remove();
    let items = [];
    for (let i = 0, j = manifestIds.length; i < j; i++) {
      items.push(api.offlineController.getManifestInfoPromise(manifestIds[i]));
    }
    Promise.all(items).then(function (results) {
      callback(null, results);
    }, function (err) {
      callback(err);
    });
  });
  subscribersId.push(api.subscribersController.addSubscriber(subscriber2));

  onSuccess(null, subscribersId);
}

function subscribeSingle (api, onSuccess, onFailure, target, manifestId, timeout) {
  const manifest = api.manifestController.getManifestById(manifestId);
  let subscriber1, subscriber2, subscribersId;
  if (manifest) {
    subscribersId = [];

    // callbackOnProgress
    subscriber1 = new Subscriber(function () {
      return api.downloadsController.downloadStats.getStats(manifestId);
    }, api.processSubscriber, target, manifestId, timeout);
    subscribersId.push(api.subscribersController.addSubscriber(subscriber1));

    // callbackOnFinish
    subscriber2 = new Subscriber(function () {
      return api.downloadsController.isDownloadFinishedAndSynced(manifestId);
    }, api.processSubscriber, target, manifestId, timeout, true);

    subscriber2.onFinish(function (callback) {
      subscriber1.remove();
      api.offlineController.getManifestInfo(manifestId, function (err, result) {
        callback(err, result);
      });
    });
    subscribersId.push(api.subscribersController.addSubscriber(subscriber2));

    onSuccess(manifest.getJsonInfo(), subscribersId);
  } else {
    onFailure(translation.getError(translation.e.manifests.NOT_FOUND, manifestId));
  }
}
