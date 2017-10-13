"use strict";
const fieldsPicker = require("../../util/fields-picker");

module.exports = function LinkSave (attr) {
  fieldsPicker(this, [
    "id",
    "contentType",
    "remoteUrl",
    "stats",
    "localUrl"
  ], attr);
};