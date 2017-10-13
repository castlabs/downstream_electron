"use strict";

/**
 *
 * @constructor
 */
function Storage () {
  this._items = {};
}

/**
 * @returns {void}
 */
Storage.prototype.clear = function () {
  this._items = {};
};

/**
 * @returns {number} number of items
 */
Storage.prototype.count = function () {
  return this.getKeys().length;
};

/**
 * @param {string} id - item identifier
 * @returns {void}
 */
Storage.prototype.decrease = function (id) {
  if (typeof this._items[id] !== "number") {
    this._items[id] = 0;
  }
  this._items[id]--;
};

/**
 * @param {string} id - item identifier
 * @returns {object} item
 */
Storage.prototype.getItem = function (id) {
  return this._items[id];
};

/**
 * @returns {object} items
 */
Storage.prototype.getItems = function () {
  return this._items;
};

/**
 * @returns {string[]} keys of all items
 */
Storage.prototype.getKeys = function () {
  return Object.keys(this._items);
};

/**
 * @param {string} id - item identifier
 * @returns {void}
 */
Storage.prototype.increase = function (id) {
  if (typeof this._items[id] !== "number") {
    this._items[id] = 0;
  }
  this._items[id]++;
};

/**
 * @param {string} id - item identifier
 * @returns {void}
 */
Storage.prototype.removeItem = function (id) {
  delete this._items[id];
};

/**
 *
 * @param {string} id - item identifier
 * @param {object} item - item to be saved
 * @returns {void}
 */
Storage.prototype.setItem = function (id, item) {
  this._items[id] = item;
};

/**
 *
 * @param {object} items - items to be saved
 * @returns {void}
 */
Storage.prototype.setItems = function (items) {
  for (let key in items) {
    if (items.hasOwnProperty(key)) {
      this.setItem(key, items[key])
    }
  }
};

module.exports = Storage;