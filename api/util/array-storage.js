"use strict";

/**
 * @constructor
 */
function ArrayStorage () {
  this._items = [];
}

/**
 * @returns {void}
 */
ArrayStorage.prototype.clear = function () {
  this._items = [];
};

/**
 *
 * @param {array} items - array items
 * @returns {void}
 */
ArrayStorage.prototype.concat = function (items) {
  this._items = this._items.concat(items);
};

/**
 *
 * @returns {number} - number of items
 */
ArrayStorage.prototype.count = function () {
  return this._items.length;
};

/**
 *
 * @returns {array} - items
 */
ArrayStorage.prototype.getItems = function () {
  return this._items;
};

/**
 *
 * @param {object} item - new item
 * @returns {void}
 */
ArrayStorage.prototype.push = function (item) {
  this._items.push(item);
};

/**
 * removes first element and returns it
 * @returns {*} - item
 */
ArrayStorage.prototype.shift = function () {
  return this._items.shift();
};

/**
 * add elements to the beginning of array
 * @returns {*} - new length of an array
 */
ArrayStorage.prototype.unshift = function () {
  return this._items.unshift.apply(this, arguments);
};

module.exports = ArrayStorage;