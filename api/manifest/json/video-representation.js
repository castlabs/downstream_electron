"use strict";
const fieldsPicker = require("../../util/fields-picker");
module.exports = function VideoRepresentation (attr) {
  fieldsPicker(this, [
    "bandwidth",
    "id",
    "height",
    "lang",
    "width",
    "durationInS"
  ], attr);
};
