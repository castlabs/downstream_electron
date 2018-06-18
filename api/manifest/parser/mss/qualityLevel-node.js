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

const ManifestNode_1 = require("../manifest-node");
const IsoDurationParser_1 = require("../../../util/Iso-duration-parser");
const FragmentInformation_1 = require("./fragment-information");
const TIME_SCALE_100_NANOSECOND_UNIT = 10000000.0;
const QualityLevelNode = (function (_super) {
  __extends(QualityLevelNode, _super);
  function QualityLevelNode (node, xml) {
    _super.call(this, node, xml);
  }

  QualityLevelNode.prototype.createSegmentInformation = function () {
    const presentationDuration = IsoDurationParser_1.IsoDurationParser.getDuration(parseFloat(this.attributeList['Duration'] / TIME_SCALE_100_NANOSECOND_UNIT));
    const representationID = this.attributeList['id'];

    this.bandwidth = (this.attributeList['bandwidth']) ? parseInt(this.attributeList['bandwidth']) : -1;

    this.segmentTemplate = this.mapMssSegmentTemplate();
    this.segmentInformation = new FragmentInformation_1.FragmentInformation(presentationDuration, this.bandwidth, this.baseURL, representationID, this.attributeList['mimeType'], this.segmentTemplate);
  };

  QualityLevelNode.prototype.mapMssSegmentTemplate = function () {
    let segmentTemplate = {};
    let mediaUrl;

    mediaUrl = this.attributeList['Url'].replace('{bitrate}', '$Bandwidth$');
    mediaUrl = mediaUrl.replace('{start time}', '$Time$');

    segmentTemplate.media = mediaUrl;
    segmentTemplate.timescale = TIME_SCALE_100_NANOSECOND_UNIT;

    segmentTemplate.SegmentTimeline = this.mapMssSegmentTimeline();

    return segmentTemplate;
  };

  QualityLevelNode.prototype.mapMssSegmentTimeline = function () {
    let segmentTimeline = {};
    let chunks = this.currentNode.parentNode.getElementsByTagName('c');
    let segments = [];
    let segment;
    let prevSegment;
    let tManifest;
    let i;
    let duration = 0;

    for (i = 0; i < chunks.length; i++) {
        segment = {};

        // Get time 't' attribute value
        tManifest = chunks[i].getAttribute('t');

        // => segment.tManifest = original timestamp value as a string (for constructing the fragment request url, see DashHandler)
        // => segment.t = number value of timestamp (maybe rounded value, but only for 0.1 microsecond)
        segment.tManifest = parseFloat(tManifest);
        segment.t = parseFloat(tManifest);

        // Get duration 'd' attribute value
        segment.d = parseFloat(chunks[i].getAttribute('d'));

        // If 't' not defined for first segment then t=0
        if ((i === 0) && !segment.t) {
            segment.t = 0;
        }

        if (i > 0) {
            prevSegment = segments[segments.length - 1];
            // Update previous segment duration if not defined
            if (!prevSegment.d) {
                if (prevSegment.tManifest) {
                    prevSegment.d = parseFloat(tManifest) - parseFloat(prevSegment.tManifest);
                } else {
                    prevSegment.d = segment.t - prevSegment.t;
                }
            }
            // Set segment absolute timestamp if not set in manifest
            if (!segment.t) {
                if (prevSegment.tManifest) {
                    segment.tManifest = parseFloat(prevSegment.tManifest) + prevSegment.d;
                    segment.t = parseFloat(segment.tManifest);
                } else {
                    segment.t = prevSegment.t + prevSegment.d;
                }
            }
        }

        duration += segment.d;

        // Create new segment
        segments.push(segment);
    }

    segmentTimeline.S = segments;
    segmentTimeline.S_asArray = segments;
    segmentTimeline.duration = duration / TIME_SCALE_100_NANOSECOND_UNIT;

    return segmentTimeline;
  };

  QualityLevelNode.prototype.writeAttributesToList = function (node, list) {
    const attrList = node.attributes;
    const mimeTypeMap = {
      'video': 'video/mp4',
      'audio': 'audio/mp4',
      'text': 'application/mp4'
    };
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

    if (list['Type'] !== undefined) {
      list['contentType'] = list['Type'];
      list['mimeType'] = mimeTypeMap[list['contentType']];
      list['bandwidth'] = list['Bitrate'];
      list['width'] = list['MaxWidth'];
      list['height'] = list['MaxHeight'];
      list.lang = list['Language'] || 'und';

      let indexId = list['Name'] ? list['Name'] : list['Type'];
      // build id
      list['id'] = indexId + '_' + list['Index'];

      if (list['Type'] === 'audio' ) {
        list.audioSamplingRate = list['SamplingRate'];
      }
    }

    if (list['Duration'] !== undefined) {
      list['durationInS'] = this.attributeList['Duration'] / TIME_SCALE_100_NANOSECOND_UNIT;
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
  QualityLevelNode.prototype.getMimeType = function () {
    return this.attributeList['mimeType'];
  };
  QualityLevelNode.prototype.hasMimeType = function () {
    return this.attributeList['mimeType'] ? true : false;
  };
  QualityLevelNode.prototype.getContentType = function () {
    return this.attributeList['contentType'];
  };
  QualityLevelNode.prototype.hasContentType = function () {
    return this.attributeList['contentType'] ? true : false;
  };
  return QualityLevelNode;
}(ManifestNode_1.ManifestNode));
exports.QualityLevelNode = QualityLevelNode;
