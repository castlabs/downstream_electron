"use strict";
const ZeroPadding = (function () {
  function ZeroPadding () {
  }

  ZeroPadding.addPadding = function (num, howManyZeros) {
    let result;
    const numArr = num.toString().split('');
    while (numArr.length < howManyZeros) {
      numArr.unshift('0');
    }
    result = numArr.join('');
    return result;
  };
  ZeroPadding.getPaddingAmount = function (inputStr) {
    const startIndex = inputStr.indexOf('%');
    const endIndex = inputStr.lastIndexOf('$');
    let numPadding = parseInt(inputStr.substring(startIndex + 1, endIndex - 1));
    numPadding = (isNaN(numPadding)) ? 0 : numPadding;
    return numPadding;
  };
  return ZeroPadding;
}());
exports.ZeroPadding = ZeroPadding;
