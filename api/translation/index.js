"use strict";

const errors = require("./_errors");
const translations = require("./_translations");
const CODES = require("./../downloads/codes");

const REGEXP_KEYS = /%[A-Za-z0-9_-]+%/g;

/**
 * @namespace <global>
 * @module util/translation
 * @property {translationErrors} e - {@link translationErrors}
 */
let translation = {};


/**
 *
 * @param {object} key - translation object
 * @returns {*} key from translation object
 * @private
 */
function _getCode (key) {
  key = key || {};
  let code = key.code;
  if (!code) {
    code = CODES.GENERAL
  }
  return code;
}

/**
 *
 * @param {object} key - translation object
 * @param {array|object|string|number|boolean} values - translation values
 * @returns {*} all key values
 * @private
 */
function _getKeyValues (key, values) {
  let translation = key;
  let keyValues = [];
  if (typeof translation === "object") {
    translation = translation.msg;
  }
  if (translation) {
    if (values instanceof Array) {
      let groups = _getUniqueKeys(translation.match(REGEXP_KEYS));
      for (let i = 0, j = Math.min(groups.length, values.length); i < j; i++) {
        let keyValue = {};
        keyValue[groups[i].replace(/%/g, "")] = values[i];
        keyValues.push(keyValue);
      }
    } else if (typeof values === "object") {
      for (let key in values) {
        if (values.hasOwnProperty(key)) {
          let keyValue = {};
          keyValue[key] = values[key];
          keyValues.push(keyValue);
        }
      }
    } else if (typeof values === "string" || typeof values === "number" || typeof values === "boolean") {
      const groups = translation.match(REGEXP_KEYS) || [];
      for (let i = 0, j = groups.length; i < j; i++) {
        let keyValue = {};
        keyValue[groups[i].replace(/%/g, "")] = values;
        keyValues.push(keyValue);
      }
    }
  }
  if (keyValues && !keyValues.length) {
    keyValues = undefined;
  }
  return keyValues;
}

/**
 *
 * @param {object} key - translation object
 * @param {array|object|string|number|boolean} values - translation values
 * @returns {*} translated message with attached values
 * @private
 */
function _getTranslation (key, values) {
  let translation = key;
  if (typeof translation === "object") {
    translation = translation.msg;
  }
  if (translation) {
    translation = _parseValues(translation, values);
  } else {
    translation = "Internal Error";
  }
  return translation;
}

/**
 *
 * @param {array} args - arguments
 * @returns {array} array of all values except 1st one
 * @private
 */
function _getValues (args) {
  let values = [];
  for (let i = 1, j = args.length; i < j; i++) {
    values.push(args[i]);
  }
  if (values.length === 0) {
    values = undefined;
  } else if (values.length === 1) {
    values = values[0]
  }
  return values;
}

/**
 *
 * @param {array} groups - matched groups
 * @returns {array} unique names
 * @private
 */
function _getUniqueKeys (groups) {
  let hashKey = {};
  let uniqueNames = [];
  groups = groups || [];
  for (let i = 0, j = groups.length; i < j; i++) {
    if (!hashKey[groups[i]]) {
      hashKey[groups[i]] = true;
      uniqueNames.push(groups[i]);
    }
  }
  return uniqueNames;
}

/**
 *
 * @param {string} translation - text to be translated
 * @param {array|object|string|number|boolean} values - values to be parsed with translation
 * @returns {*} translation
 * @private
 */
function _parseValues (translation, values) {
  values = values || {};
  if (values instanceof Array) {
    const groups = _getUniqueKeys(translation.match(REGEXP_KEYS));
    for (let i = 0, j = Math.min(groups.length, values.length); i < j; i++) {
      translation = translation.replace(new RegExp(groups[i], "g"), values[i]);
    }
  } else if (typeof values === "object") {
    for (let key in values) {
      if (values.hasOwnProperty(key)) {
        translation = translation.replace(new RegExp("%" + key + "%", "g"), values[key]);
      }
    }
    translation = translation.replace(REGEXP_KEYS, values);

  } else if (typeof values === "string" || typeof values === "number" || typeof values === "boolean") {
    translation = translation.replace(REGEXP_KEYS, values);

  }
  return translation;
}

/**
 * @alias module:util/translation.getError
 * @param {object} key - translation object
 * @returns {{code: *, msg: *, keys: *}} - error object with code, msg and keys
 */
function getError (key) {
  const values = _getValues(arguments);
  const keyValues = _getKeyValues(key, values);
  const msg = _getTranslation(key, values);
  const code = _getCode(key);
  return {
    code: code,
    msg: msg,
    keys: keyValues,
  };
}

/**
 * @alias module:util/translation.getTranslation
 * @static
 * @param {object} key - translation object
 * @returns {*} - return translated string with correctly applied values
 */
function getTranslation (key) {
  const values = _getValues(arguments);
  return _getTranslation(key, values);
}

translation.getError = getError;
translation.getTranslation = getTranslation;
translation.e = errors;
translation.t = translations;

module.exports = translation;
