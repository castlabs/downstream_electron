"use strict";

function removeCharacter (text, pos) {
  let newText;
  newText = text.substr(0, pos - 1);
  if (text.length > pos) {
    newText += text.substr(pos, text.length);
  }
  return newText;
}

function getInvalidDiff (text, regex, openingTag, closingTag) {
  let value = String(text);
  let check = true;
  let i = 1;
  while (check) {
    let valueToCheck = value.substr(0, i);

    if (!valueToCheck.match(regex)) {
      value = removeCharacter(value, i);
    } else {
      i++;
    }
    if (i > value.length) {
      check = false;
    }
  }
  let arrValue = value.split("");
  for (let i = 0, j = text.length; i < j; i++) {
    if (i >= arrValue.length || text[i] !== arrValue[i]) {
      arrValue.splice(i, 0, openingTag + text[i] + closingTag);
    }
  }
  return arrValue.join("");
}

module.exports = getInvalidDiff;