"use strict";

function bind (scope, f) {
  return function bindF () {
    f.apply(scope, arguments);
  }
}

function bindAll (scope) {
  for (let i = 1, j = arguments.length; i < j; i++) {
    let fName = arguments[i];
    scope[fName] = bind(scope, scope[fName]);
  }
}

module.exports = {
  bind: bind,
  bindAll: bindAll
};