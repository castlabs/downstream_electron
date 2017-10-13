"use strict";
const codes = {
  GENERAL: -1,
  ERRORS: {
    INTERNAL_ERROR: 1,
    BROKEN: 11,
    FINISHED: 12,
    UNFINISHED: 13,
    STOPPED: 14,
    CREATED: 15,
    MISSING: 16,
    RESUMED: 17,
    STARTED: 18,
    LOADING: 19,
    REMOVED: 20,
    INFO: 21,
    NOT_FOUND: 100,
  }
};
module.exports = codes;

