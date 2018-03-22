"use strict";
const fieldsPicker = require("../../util/fields-picker");

module.exports = function LinkSave (attr) {
  fieldsPicker(this, [
    "id",
    "contentType",
    "bandwidth",
    "remoteUrl",
    "stats",
    "localUrl"
  ], attr);
};