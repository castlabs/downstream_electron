"use strict";
const Snowflake = require("./snowflake-id");
const _ = require("underscore");

/**
 *
 * @param {function} process - function to get the result from
 * @param {function} callback - callback to be invoked when "process" function returns anything
 * @param {number} target - window target id
 * @param {string} manifestId - manifest identifier
 * @param {number} time - time in miliseconds how often the callback should be invoked
 * @param {boolean} onceOnly - if set to true the callback will be invoked once only and subsriber will be removed
 * @constructor
 */
function Subscriber (process, callback, target, manifestId, time, onceOnly) {
  this._process = process;
  this._callback = callback;
  this._manifestId = manifestId;
  this._id = String(Snowflake.SnowflakeId.getUUID());
  this._onceOnly = onceOnly;
  this._target = target;
  this.onInterval = function () {
    const result = this._process();
    const self = this;
    if (result) {
      if (this._onceOnly) {
        this.remove();
        if (typeof this._callbackOnFinish === "function") {
          this._callbackOnFinish(function (err, result) {
            self._callback(self._id, err, result, self._target, true);
          });
        } else {
          this._callback(this._id, null, result, self._target);
        }
      } else {
        this._callback(this._id, null, result, self._target);
      }
    }
  };
  _.bindAll(this, "onInterval");
  this._intervalTimer = setInterval(this.onInterval, time);
}

/**
 *
 * @returns {string} - subscriber identifier
 */
Subscriber.prototype.getId = function () {
  return this._id;
};

/**
 *
 * @returns {string} - manifest identifier
 */
Subscriber.prototype.getManifestId = function () {
  return this._manifestId;
};

/**
 * @param {function} callback - function to be invoked when "process" function returns anything
 * and when "onceOnly" is set to true
 * @returns {void}
 */
Subscriber.prototype.onFinish = function (callback) {
  this._callbackOnFinish = callback;
};

/**
 * @returns {void}
 */
Subscriber.prototype.remove = function () {
  clearInterval(this._intervalTimer);
};

module.exports = Subscriber;