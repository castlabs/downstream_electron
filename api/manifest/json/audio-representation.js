"use strict";
const fieldsPicker = require("../../util/fields-picker");

module.exports = function AudioRepresentation (attr) {
  fieldsPicker(this, [
    "audioSamplingRate",
    "bandwidth",
    "id",
    "lang",
    "durationInS"
  ], attr);
};
