"use strict";

module.exports = function fieldsPicker (obj, fields, attr) {
  if (typeof attr === "undefined") {
    return;
  }
  for (let i = 0, j = fields.length; i < j; i++) {
    const field = fields[i];
    const defaultValue = field.defaultValue;
    const name = field.name || field;
    obj[name] = typeof attr[name] !== "undefined" ? attr[name] : defaultValue;
  }
};
