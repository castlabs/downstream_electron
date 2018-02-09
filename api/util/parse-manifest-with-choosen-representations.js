"use strict";
const constants = require("../constants");

const Manifest = require("../manifest/loader/manifest").Manifest;
const ManifestXML = require("../manifest/parser/manifest-xml").ManifestXML;

const XMLSerializer = require("xmldom").XMLSerializer;

function getMimeType (value) {
  if (value.indexOf("video") !== -1) {
    return "video";
  } else if (value.indexOf("audio") !== -1) {
    return "audio";
  } else {
    return "text";
  }
}

function parseManifestWithChoosenRepresentations (manifest, representations) {
  const manifestId = manifest.id;
  const xmlSerializer = new XMLSerializer();
  const manifestUrl = manifest.getManifestUrl();
  const manifestString = xmlSerializer.serializeToString(manifest.getManifestXML());

  manifest = new Manifest(manifestId);
  manifest.loadFromStr(manifestString, manifestUrl);

  const video = representations.video;
  const audio = representations.audio;
  const text = representations.text;

  let chosenRepresentations = {};
  chosenRepresentations["video"] = {};
  for (let i = 0, j = video.length; i < j; i++) {
    chosenRepresentations["video"][video[i]] = true;
  }
  chosenRepresentations["audio"] = {};
  for (let i = 0, j = audio.length; i < j; i++) {
    chosenRepresentations["audio"][audio[i]] = true;
  }
  chosenRepresentations["text"] = {};
  for (let i = 0, j = text.length; i < j; i++) {
    chosenRepresentations["text"][text[i]] = true;
  }

  function markNodeForDownload (repr) {
    for (let i = 0, j = repr.length; i < j; i++) {
      for (let k = 0, l = repr[i].representationColl.length; k < l; k++) {
        let id = repr[i].representationColl[k].attributeList.id;
        let mimeType = getMimeType(repr[i].representationColl[k].attributeList.mimeType);
        if (chosenRepresentations[mimeType][id]) {
          repr[i].representationColl[k].markNodeForDownload(true);
        }
      }
    }
  }

  // fix the baseURL by removing http and https the same is done when saving a file
  // see api/util/downloads.js -> getDownloadLinks
  function fixBaseURL (repr) {
    for (let i = 0, j = repr.length; i < j; i++) {
      let baseURL = repr[i].currentNode.getElementsByTagName("BaseURL")[0];
      if (baseURL && baseURL.textContent.match(constants.regexpProtocolRemove)) {
        baseURL.textContent = baseURL.textContent.replace(constants.regexpProtocolRemove, "");
      }
    }
  }

  markNodeForDownload(manifest.getVideoRepresentations());
  markNodeForDownload(manifest.getAudioRepresentations());
  markNodeForDownload(manifest.getTextRepresentations());

  fixBaseURL(manifest.getVideoRepresentations());
  fixBaseURL(manifest.getAudioRepresentations());
  fixBaseURL(manifest.getTextRepresentations());

  manifest.removeNode();

  return xmlSerializer.serializeToString(manifest.getManifestXML());
}

module.exports = parseManifestWithChoosenRepresentations;
