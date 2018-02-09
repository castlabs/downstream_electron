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
const MediaUrl_1 = require("../media-url");
const SegmentInformation_1 = require("../segment-information");
const FragmentInformation = (function (_super) {
  __extends(FragmentInformation, _super);
  function FragmentInformation (presentationDuration, bandwidth, baseUrl, representationID, mimeType, segmentTemplate) {
    _super.call(this, presentationDuration, bandwidth, baseUrl, representationID, mimeType);
    if (segmentTemplate) {
      this.segmentTemplate = segmentTemplate;
      this.mediaTemplate = this.segmentTemplate.media;
      this.mediaTemplate = this.replace$Bandwidth$(this.mediaTemplate, this.bandwidth);
    }
    if(this.segmentTemplate.media) {
      this.timelineItemList = this.segmentTemplate.SegmentTimeline;
    }
    this.createFragmentUrlsFromTimeline(this.timelineItemList);
  }

  FragmentInformation.prototype.createFragmentUrlsFromTimeline = function (segmentNodes) {
    for (let i = 0; i < segmentNodes.S.length; i++) {
      let fragment = this.mediaTemplate;
      fragment = this.replace$Time$(fragment, segmentNodes.S[i].t);

      this.mediaUrls.push(new MediaUrl_1.MediaUrl(this.baseUrl, fragment, this.mimeType));
    }
  };
  return FragmentInformation;
}(SegmentInformation_1.SegmentInformation));
exports.FragmentInformation = FragmentInformation;