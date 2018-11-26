"use strict";
const fieldsPicker = require("../../util/fields-picker");
module.exports = function TextRepresentation (attr) {
  fieldsPicker(this, [
    "bandwidth",
    "id",
    "lang",
    "durationInS"
  ], attr);
};
