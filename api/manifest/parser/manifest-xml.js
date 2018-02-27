"use strict";
const AdaptationSetNode_1 = require("./adaptation-set-node");
const DOMParser = require('xmldom').DOMParser;
const ManifestXML = (function () {
  function ManifestXML () {
  }
  ManifestXML.prototype.parse = function (str, onSuccess, onError) {
    let parser;
    if (typeof onSuccess === "function" && typeof onError === "function") {
      parser = new DOMParser({
        errorHandler: {
          warning: function () {},
          error: onError, fatalError: onError
        }
      });

    } else {
      parser = new DOMParser();
    }
    this.adaptationSetColl = [];
    this.xml = parser.parseFromString(str, "application/xml");

    this.parseAdaptations();

    if (typeof onSuccess === "function") {
      onSuccess();
    }
  };
  ManifestXML.prototype.getAdaptationSetNodeName = function () {
    return 'AdaptationSet';
  };
  ManifestXML.prototype.getRepresentationNodeName = function () {
    return 'Representation';
  };
  ManifestXML.prototype.parseAdaptations = function () {
    const adaptations = this.xml.getElementsByTagName('AdaptationSet');
    for (let i = 0; i < adaptations.length; i++) {
      const adaptNode = new AdaptationSetNode_1.AdaptationSetNode(adaptations[i], this.xml);
      this.adaptationSetColl[i] = adaptNode;
    }
  };
  ManifestXML.prototype.getVideoAdaptation = function () {
    return this.getAdaptations('video');
  };
  ManifestXML.prototype.getAudioAdaptation = function () {
    return this.getAdaptations('audio');
  };
  ManifestXML.prototype.getTextAdaptation = function () {
    return this.getAdaptations('text');
  };
  ManifestXML.prototype.getManifestXML = function () {
    return this.xml;
  };
  ManifestXML.prototype.getAdaptations = function (which) {
    const adaptations = this.adaptationSetColl.map(function (item) {
      return item;
    }).filter(function (item) {
      if (item.isMimeType(which) || item.isContentType(which)) {
        return true;
      }
    });
    return adaptations;
  };
  ManifestXML.cloneXML = function (xml) {
    const newDocument = xml.implementation.createDocument(xml.namespaceURI, null, null);
    const newNode = newDocument.importNode(xml.documentElement, true);
    newDocument.appendChild(newNode);
    return newDocument;
  };
  ManifestXML.prototype.removeNode = function () {
    const self = this;
    let representationCollection = this.xml.documentElement.getElementsByTagName(this.getRepresentationNodeName());
    let adaptationCollection = this.xml.documentElement.getElementsByTagName(this.getAdaptationSetNodeName());
    let repArray = [];
    let adaptationArray = [];
    for (let i = 0; i < representationCollection.length; i++) {
      repArray[i] = representationCollection[i];
    }
    repArray.forEach(function (item) {
      const markForDownload = (item.attributes.getNamedItem("markForDownload") &&
          item.attributes.getNamedItem("markForDownload").value == 'true')
          ? true : false;
      if (!markForDownload) {
        item.parentNode.removeChild(item);
      }
      item.removeAttribute('markForDownload');
    }, this);
    for (let i = 0; i < adaptationCollection.length; i++) {
      adaptationArray[i] = adaptationCollection[i];
    }
    adaptationArray.forEach(function (item) {
      if (!item.getElementsByTagName(self.getRepresentationNodeName()).length) {
        item.parentNode.removeChild(item);
      }
    });
  };
  return ManifestXML;
}());
exports.ManifestXML = ManifestXML;
