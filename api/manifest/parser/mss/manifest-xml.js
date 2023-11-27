"use strict";
const ManifestXML_1 = require("../manifest-xml");
const StreamIndexNode_1 = require("./streamIndex-node");


ManifestXML_1.ManifestXML.prototype.getManifestType = function (xml) {
  return xml.getElementsByTagName('SmoothStreamingMedia').length !== 0 ? 'MSS' : 'DASH';
};

ManifestXML_1.ManifestXML.prototype.getAdaptationSetNodeName = function () {
  return (this.manifestType === 'MSS') ? 'StreamIndex' : 'AdaptationSet';
};
ManifestXML_1.ManifestXML.prototype.getRepresentationNodeName = function () {
  return (this.manifestType === 'MSS') ? 'QualityLevel' : 'Representation';
};
ManifestXML_1.ManifestXML.prototype.parseStreams = function () {
  const streams = this.xml.getElementsByTagName('StreamIndex');
  for (let i = 0; i < streams.length; i++) {
    const streamNode = new StreamIndexNode_1.StreamIndexNode(streams[i], this.xml);
    this.adaptationSetColl[i] = streamNode;
  }
};
ManifestXML_1.ManifestXML.prototype._parseAdaptations = ManifestXML_1.ManifestXML.prototype.parseAdaptations;
ManifestXML_1.ManifestXML.prototype.parseAdaptations = function () {
  // Manifest type detection
  this.manifestType = this.getManifestType(this.xml);

  if (this.manifestType === 'MSS') {
    return this.parseStreams();
  } else {
    return this._parseAdaptations();
  }
};

exports.ManifestXML = ManifestXML_1.ManifestXML;
