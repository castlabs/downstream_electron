"use strict";
const moment = require("moment/moment");
const IsoDurationParser = (function () {
  function IsoDurationParser () {
  }

  IsoDurationParser.getDuration = function (val) {
    const dur = moment.duration(val);
    return dur.asMilliseconds();
  };
  IsoDurationParser.getDurationAsS = function (val) {
    const dur = moment.duration(val);
    return dur.asSeconds();
  };
  IsoDurationParser.getMoment = function () {
    return moment;
  };
  return IsoDurationParser;
}());
exports.IsoDurationParser = IsoDurationParser;
