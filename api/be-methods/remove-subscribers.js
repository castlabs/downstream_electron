"use strict";

module.exports = function (api, onSuccess, onFailure, target, subscribers) {
  api.subscribersController.removeSubscribersById(subscribers);
  onSuccess();
};

