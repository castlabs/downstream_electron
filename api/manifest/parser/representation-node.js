"use strict";
const __extends = (this && this.__extends) || function (d, b) {
      for (let p in b) {
        if (b.hasOwnProperty(p)) {
          d[p] = b[p];
        }
      }
      function __ () {
        this.constructor = d;
      }

      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
const ManifestNode_1 = require("./manifest-node");
const SegmentInformation_1 = require("./segment-information");
const IsoDurationParser_1 = require("../../util/Iso-duration-parser");
const RepresentationNode = (function (_super) {
  __extends(RepresentationNode, _super);
  function RepresentationNode (node, xml) {
    _super.call(this, node, xml);
    this.markNodeForDownload(false);
  }

  RepresentationNode.prototype.createSegmentInformation = function () {
    const presentationDuration = IsoDurationParser_1.IsoDurationParser.getDuration(
        this.attributeList['mediaPresentationDuration']);
    let segmentTimeline;
    let timelineItemList;
    let segmentUrlList;
    const representationID = this.attributeList['id'];
    if (this.segmentTemplate && this.segmentTemplate.hasChildNodes()) {
      for (let i = 0; i < this.segmentTemplate.childNodes.length; i++) {
        if (this.segmentTemplate.childNodes[i].nodeName == "SegmentTimeline") {
          segmentTimeline = this.segmentTemplate.childNodes[i];
        }
      }
    }
    try {
      timelineItemList = segmentTimeline.getElementsByTagName('S');
    } catch (e) {}
    try {
      segmentUrlList = this.segmentList.getElementsByTagName('SegmentURL');
    } catch (e) {}
    this.bandwidth = (this.attributeList['bandwidth']) ? parseInt(this.attributeList['bandwidth']) : -1;
    this.segmentInformation = new SegmentInformation_1.SegmentInformation(presentationDuration, this.bandwidth, this.baseURL, representationID, this.attributeList['mimeType'], this.segmentBase, this.segmentTemplate, segmentTimeline, timelineItemList, this.segmentList, segmentUrlList);
  };
  RepresentationNode.prototype.writeAttributesToList = function (node, list) {
    const attrList = node.attributes;
    for (let i = 0; i < node.childNodes.length; i++) {
      if (!this.baseURL && node.childNodes[i].nodeName == 'BaseURL') {
        this.baseURL = node.childNodes[i].firstChild.nodeValue;
      }
      if (!this.segmentBase && node.childNodes[i].nodeName == 'SegmentBase') {
        this.segmentBase = node.childNodes[i];
      }
      if (!this.segmentTemplate && node.childNodes[i].nodeName == 'SegmentTemplate') {
        this.segmentTemplate = node.childNodes[i];
      }
      if (!this.segmentList && node.childNodes[i].nodeName == 'SegmentList') {
        this.segmentList = node.childNodes[i];
      }
    }
    for (let attr in attrList) {
      if (!list[attrList[attr].nodeName]) {
        list[attrList[attr].nodeName] = attrList[attr].nodeValue;
      }
    }
    if (list['mediaPresentationDuration'] !== undefined) {
      list['durationInS'] = IsoDurationParser_1.IsoDurationParser.getDurationAsS(
        this.attributeList['mediaPresentationDuration']);
    }

    if (node.parentNode !== null) {
      this.buildAttributeList(node.parentNode, list);
    } else {
      if (!this.segmentInformation) {
        this.createSegmentInformation();
      }
    }
    _super.prototype.writeAttributesToList.call(this, node, list);
  };
  RepresentationNode.prototype.getMimeType = function () {
    return this.attributeList['mimeType'] || this.attributeList['contentType'];
  };
  RepresentationNode.prototype.hasMimeType = function () {
    return this.attributeList['mimeType'] || this.attributeList['contentType'] ? true : false;
  };
  RepresentationNode.prototype.getMediaUrlList = function () {
    return this.segmentInformation.getMediaUrlList();
  };
  RepresentationNode.prototype.getRepresentationId = function () {
    return this.id;
  };
  return RepresentationNode;
}(ManifestNode_1.ManifestNode));
exports.RepresentationNode = RepresentationNode;
