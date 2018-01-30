"use strict";

function isUTF16 (data) {
  var i = 0;
  var len = data && data.length;
  var pos = null;
  var b1, b2, next, prev;

  if (len < 2) {
      if (data[0] > 0xFF) {
          return false;
      }
  } else {
      b1 = data[0];
      b2 = data[1];
      if (b1 === 0xFF && // BOM (little-endian)
          b2 === 0xFE) {
          return true;
      }
      if (b1 === 0xFE && // BOM (big-endian)
          b2 === 0xFF) {
          return true;
      }

      for (; i < len; i++) {
          if (data[i] === 0x00) {
              pos = i;
              break;
          } else if (data[i] > 0xFF) {
              return false;
          }
      }

      if (pos === null) {
          return false; // Non ASCII
      }

      next = data[pos + 1]; // BE
      if (next !== void 0 && next > 0x00 && next < 0x80) {
          return true;
      }

      prev = data[pos - 1]; // LE
      if (prev !== void 0 && prev > 0x00 && prev < 0x80) {
          return true;
      }
  }

  return false;
}

module.exports = {
  isUTF16: isUTF16
}