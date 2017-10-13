"use strict";
/**
 *
 * @constructor
 */
function SubscribersController () {
  this._subscribers = {};
}

/**
 *
 * @param {Subscriber} subscriber - subscriber
 * @returns {void}
 */
SubscribersController.prototype.addSubscriber = function (subscriber) {
  const id = subscriber.getId();
  this._subscribers[id] = subscriber;
  return id;
};

/**
 *
 * @param {Array|String} subscribersId - subscriber identifier
 * @returns {void}
 */
SubscribersController.prototype.removeSubscribersById = function (subscribersId) {
  if (typeof subscribersId === "string") {
    subscribersId = [subscribersId];
  }
  for (let i = 0, j = subscribersId.length; i < j; i++) {
    if (this._subscribers[subscribersId[i]]) {
      this._subscribers[subscribersId[i]].remove();
      delete(this._subscribers[subscribersId[i]]);
    }
  }
};

/**
 *
 * Remove all subscribers for certain manifest based on any subscriberId that belongs to this manifest
 * @param {Array|String} subscriberId - subscriber identifier
 * @returns {void}
 */
SubscribersController.prototype.removeAllManifestSubscribersById = function (subscriberId) {
  let subscriber = subscriberId && this._subscribers[subscriberId];
  if (subscriber) {
    this.unsubscribe(subscriber.getManifestId());
  }
};

/**
 *
 * @param {Array|String} manifestIds - manifest or manifests identifier
 * @returns {void}
 */
SubscribersController.prototype.unsubscribe = function (manifestIds) {
  let subscribersId = [];
  let manifestIdsHash = {};
  if (typeof manifestIds === "string") {
    manifestIds = [manifestIds];
  }
  manifestIds = manifestIds || [];
  for (let i = 0, j = manifestIds.length; i < j; i++) {
    manifestIdsHash[manifestIds[i]] = true;
  }

  for (let key in this._subscribers) {
    if (this._subscribers.hasOwnProperty(key)) {
      if (manifestIdsHash[this._subscribers[key].getManifestId()]) {
        subscribersId.push(key);
      }
    }
  }

  this.removeSubscribersById(subscribersId);
};

/**
 * @returns {void}
 */
SubscribersController.prototype.unsubscribeAll = function () {
  for (let key in this._subscribers) {
    if (this._subscribers.hasOwnProperty(key)) {
      this._subscribers[key].remove();
    }
  }
  this._subscribers = {};
};

module.exports = SubscribersController;
