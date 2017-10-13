"use strict";
const AudioRepresentation = require("../json/audio-representation");
const VideoRepresentation = require("../json/video-representation");
const TextRepresentation = require("../json/text-representation");

module.exports = function jsonRepresentation (representations) {
  let reprObj = [];
  for (let i = 0, j = representations.length; i < j; i++) {
    const cols = representations[i].representationColl;
    for (let k = 0, l = cols.length; k < l; k++) {
      const attr = cols[k].attributeList;
      let contentType = attr.contentType || attr.mimeType;
      if (contentType.indexOf("video") >= 0) {
        contentType = "video";
      } else if (contentType.indexOf("audio") >= 0) {
        contentType = "audio";
      } else {
        contentType = "text";
      }
      switch (contentType) {
        case "audio":
          reprObj.push(new AudioRepresentation(attr));
          break;

        case "video":
          reprObj.push(new VideoRepresentation(attr));
          break;

        default:
          reprObj.push(new TextRepresentation(attr));
      }
    }
  }
  return reprObj;
};
