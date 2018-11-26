"use strict";
const CODES = require("./../downloads/codes");

const translationErrors = {
  downloads: {
    _GENERAL: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Sorry we are unable to process your request - some internal error occurred",
    },
    ALREADY_FINISHED: {
      code: CODES.ERRORS.FINISHED,
      msg: "This download '%manifestId%' has been already finished.",
    },
    ALREADY_REMOVED_ALL_UNFINISHED: {
      code: CODES.ERRORS.REMOVED,
      msg: "All unfinished downloads have been already removed, nothing left.",
    },
    ALREADY_RESUMED: {
      code: CODES.ERRORS.RESUMED,
      msg: "This download '%manifestId%' has been already resumed.",
    },
    ALREADY_STOPPED: {
      code: CODES.ERRORS.STOPPED,
      msg: "This download '%manifestId%' has been already stopped or has been already downloaded.",
    },
    ALREADY_STOPPED_ALL: {
      code: CODES.ERRORS.STOPPED,
      msg: "There are no downloads to be stopped.",
    },
    ALREADY_STARTED: {
      code: CODES.ERRORS.STARTED,
      msg: "This download '%manifestId%' has been already started.",
    },
    BROKEN_CANNOT_BE_RESUMED: {
      code: CODES.ERRORS.BROKEN,
      msg: "This download '%manifestId%' is broken and cannot be resumed.",
    },
    INFO_FAILED: {
      code: CODES.ERRORS.INFO,
      msg: "Gettting info of download '%manifestId%' failed.",
    },
    REMOVING_ALL_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Removing of all downloads failed.",
    },
    REMOVING_ALL_UNFINISHED_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Removing of all unfinished downloads failed.",
    },
    REMOVING_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Removing of download '%manifestId%' failed.",
    },
    RESUMING_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Resuming of download '%manifestId%' failed.",
    },
    UPDATE_DOWNLOAD_FOLDER_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Updating of download folder for '%manifestId%' failed.",
    },
    STOPPING_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Stopping of download '%manifestId%' failed.",
    },
    SAVING_PERSISTENT_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Saving persistent info for download '%manifestId%' failed.",
    },
    SAVING_DATA_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Saving data for download '%manifestId%' failed.",
    },
    STOPPING_ALL_FAILED: {
      code: CODES.ERRORS.INTERNAL_ERROR,
      msg: "Stopping all downloads failed.",
    },
    UNFINISHED: {
      code: CODES.ERRORS.UNFINISHED,
      msg: "This download is not ready yet.",
    },
  },
  manifests: {
    NOT_FOUND: {
      code: CODES.ERRORS.NOT_FOUND,
      msg: "Manifest with id='%manifestId%' not found."
    },
    LOADING_FAILED: {
      code: CODES.ERRORS.LOADING,
      msg: "Could not load manifest from url '%manifestUrl%'."
    },
    LIST_LOADING_FAILED: {
      code: CODES.ERRORS.LOADING,
      msg: "Could not load list of manifests."
    },
    FOLDER_ALREADY_EXISTS: {
      code: CODES.ERRORS.EXISTS,
      msg: "Folder for manifest with id ='%manifestId%' already exists."
    },
    INVALID_ID: {
      code: CODES.ERRORS.BROKEN,
      msg: "Provided custom id for manifest is not valid: ('%invalid%')"
    },
  }
};

module.exports = translationErrors;
