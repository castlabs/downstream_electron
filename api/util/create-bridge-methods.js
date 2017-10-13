"use strict";

/**
 * the idea is to copy the methods from storage so that they can be triggered from parent object and then propagated back
 * to the storage object.
 * for example:
 *    someController.storage.status.setItem(manifestId, someKey, someValue);
 *    someController.storage.downloads.setItem(manifestId, someKey, someValue);
 * @param {object} scope - parent object where the method "From" object will be bridged to
 * @param {object} From - object where the original method was declared
 * @returns {void}
 */
function createBridgeMethods (scope, From) {
  function action () {
    let args = [], i, j;
    for (i = 0, j = arguments.length; i < j; i++) {
      args.push(arguments[i]);
    }
    args.unshift(this._storageKey);
    return this._parent._itemAction.apply(this._parent, args);
  }

  for (let methodName in From.prototype) {
    if (From.prototype.hasOwnProperty(methodName)) {
      scope[methodName] = action.bind(scope, methodName);
    }
  }
}

module.exports = createBridgeMethods;