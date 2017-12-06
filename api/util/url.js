"use strict";

function join () {
  let pathString = "", arg;
  for (let i = 0, j = arguments.length; i < j; i++) {
    arg = arguments[i].replace(/^\.\//g, "/");
    // don't add to the last one
    pathString += arg;
    if (i < j - 1) {
      pathString += "/";
    }
  }
  pathString = pathString.replace(/\/{2,}/g, "/");
  pathString = pathString.replace("https:/", "https://");
  pathString = pathString.replace("http:/", "http://");
  pathString = pathString.replace("file:/", "file://");
  return pathString;
}

function joinPath () {
  return join.apply(null, arguments) + "/";
}

function joinPathWithFile () {
  return join.apply(null, arguments);
}

module.exports = {
  joinPath: joinPath,
  joinPathWithFile: joinPathWithFile
};
