"use strict";
const ZeroPadding_1 = require("../../util/zero-padding");
const MediaUrl_1 = require("./media-url");
let CREATE_URL;
(function (CREATE_URL) {
  CREATE_URL[CREATE_URL["FROM_TEMPLATE"] = 0] = "FROM_TEMPLATE";
  CREATE_URL[CREATE_URL["FROM_TIMELINE"] = 1] = "FROM_TIMELINE";
  CREATE_URL[CREATE_URL["FROM_SEGMENTLIST"] = 2] = "FROM_SEGMENTLIST";
  CREATE_URL[CREATE_URL["FROM_SEGMENT_BASE"] = 3] = "FROM_SEGMENT_BASE";
})(CREATE_URL || (CREATE_URL = {}));
const SegmentInformation = (function () {
  function SegmentInformation (presentationDuration, bandwidth, baseUrl, representationID, mimeType, segmentBase,
                               segmentTemplate, segmentTimeline, timelineItemList, segmentList, segmentUrlList) {
    this.hasSegmentBase = false;
    this.baseUrl = '';
    this.presentationDuration = 0;
    this.bandwidth = 0;
    this.startNumber = 0;
    this.mediaUrls = [];
    this.whichUseCase = -1;
    this.mimeType = '';
    SegmentInformation.count += 1;
    this.presentationDuration = presentationDuration;
    this.mimeType = mimeType;
    if (baseUrl) {
      this.baseUrl = baseUrl;
    }

    if (bandwidth) {
      this.bandwidth = bandwidth;
    }
    if (representationID) {
      this.representationID = representationID;
    }
    if (segmentBase) {
      this.segmentBase = segmentBase;
      this.hasSegmentBase = true;
      this.whichUseCase = CREATE_URL.FROM_SEGMENT_BASE;
    }
    if (segmentTemplate) {
      this.segmentTemplate = segmentTemplate;
      this.mediaTemplate = this.segmentTemplate.attributes.getNamedItem("media").nodeValue;
      this.mediaTemplate = this.replace$RepresentationID$(this.mediaTemplate, this.representationID);
      this.mediaTemplate = this.replace$Bandwidth$(this.mediaTemplate, this.bandwidth);
      this.startNumber = (this.segmentTemplate.attributes.getNamedItem("startNumber")) ? parseInt(
          this.segmentTemplate.attributes.getNamedItem("startNumber").nodeValue) : 0;
      this.whichUseCase = CREATE_URL.FROM_TEMPLATE;
    }
    if (segmentTimeline) {
      this.segmentTimeline = segmentTimeline;
    }
    if (timelineItemList) {
      this.timelineItemList = timelineItemList;
      this.whichUseCase = CREATE_URL.FROM_TIMELINE;
    }
    if (segmentList) {
      this.segmentList = segmentList;
    }
    if (segmentUrlList) {
      this.segmentUrlList = segmentUrlList;
      this.whichUseCase = CREATE_URL.FROM_SEGMENTLIST;
    }
    let hasFileExtension = false;
    let initSegment = '';
    switch (this.whichUseCase) {
      case CREATE_URL.FROM_SEGMENTLIST:
        this.createFragmentFromUrlList(this.segmentUrlList);
        initSegment = this.createInitSegment(
            this.segmentList.getElementsByTagName('Initialization')[0].attributes.getNamedItem("sourceURL").nodeValue);
        this.mediaUrls.unshift(new MediaUrl_1.MediaUrl(this.baseUrl, initSegment, this.mimeType));
        if (SegmentInformation.count == 0) {
          // console.log('CREATE_URL.FROM_SEGMENTLIST', this.mediaUrls, this);
        }
        break;

      case CREATE_URL.FROM_TIMELINE:
        initSegment = this.createInitSegment(this.segmentTemplate.attributes.getNamedItem("initialization").nodeValue);
        this.mediaUrls.unshift(new MediaUrl_1.MediaUrl(this.baseUrl, initSegment, this.mimeType));
        this.createFragmentUrlsFromTimeline(this.timelineItemList);
        break;

      case CREATE_URL.FROM_SEGMENT_BASE:
        try {
          hasFileExtension = (this.baseUrl.indexOf('.') !== -1) ? true : false;
        } catch (e) {}
        if (hasFileExtension) {
          this.mediaUrls.push(new MediaUrl_1.MediaUrl(this.baseUrl, this.baseUrl, this.mimeType));
        }
        if (SegmentInformation.count == 0) {
          // console.log('CREATE_URL.FROM_SEGMENT_BASE', this.mediaUrls, this);
        }
        break;

      case CREATE_URL.FROM_TEMPLATE:
        this.createFragmentsFromTemplate();
        initSegment = this.createInitSegment(this.segmentTemplate.attributes.getNamedItem("initialization").nodeValue);
        this.mediaUrls.unshift(new MediaUrl_1.MediaUrl(this.baseUrl, initSegment, this.mimeType));
        break;

      default:
        try {
          hasFileExtension = (this.baseUrl.indexOf('.') !== -1) ? true : false;
        } catch (e) {}
        if (hasFileExtension) {
          this.mediaUrls.push(new MediaUrl_1.MediaUrl("", this.baseUrl, this.mimeType));
        }
    }
  }

  SegmentInformation.prototype.createFragmentUrlsFromTimeline = function (segmentNodes) {
    let currentTime = this.segmentTemplate.attributes.getNamedItem("presentationTimeOffset");
    if (currentTime) {
      currentTime = parseInt(currentTime.nodeValue, 10);
    } else {
      currentTime = 0;
    }
    let hasCurrentTime = false;
    let time = 0;
    for (let i = 0; i < segmentNodes.length; i++) {
      if (i > 0 && segmentNodes[i].attributes.getNamedItem("t") && segmentNodes[i].attributes.getNamedItem(
              "t").nodeValue !== undefined) {
        hasCurrentTime = true;
        time = parseInt(segmentNodes[i].attributes.getNamedItem("t").nodeValue);
      } else {
        hasCurrentTime = false;
      }
      const duration = (segmentNodes[i].attributes.getNamedItem("d") && segmentNodes[i].attributes.getNamedItem(
          "d").nodeValue !== undefined) ? parseInt(segmentNodes[i].attributes.getNamedItem("d").nodeValue) : 0;
      const repeat = (segmentNodes[i].attributes.getNamedItem("r") && segmentNodes[i].attributes.getNamedItem(
          "r").nodeValue !== undefined) ? parseInt(segmentNodes[i].attributes.getNamedItem("r").nodeValue) : 0;
      for (let k = 1; k <= repeat; k++) {
        let fragment_1 = this.segmentTemplate.attributes.getNamedItem("media").nodeValue;
        fragment_1 = this.replace$RepresentationID$(fragment_1, this.representationID);
        fragment_1 = this.replace$Time$(fragment_1, currentTime);
        fragment_1 = this.replace$Bandwidth$(fragment_1, this.bandwidth);

        this.mediaUrls.push(new MediaUrl_1.MediaUrl(this.baseUrl, fragment_1, this.mimeType));
        if (!hasCurrentTime) {
          currentTime += duration;
        } else {
          currentTime = time;
        }
      }
      let fragment = this.segmentTemplate.attributes.getNamedItem("media").nodeValue;
      fragment = this.replace$RepresentationID$(fragment, this.representationID);
      fragment = this.replace$Time$(fragment, currentTime);
      fragment = this.replace$Bandwidth$(fragment, this.bandwidth);

      this.mediaUrls.push(new MediaUrl_1.MediaUrl(this.baseUrl, fragment, this.mimeType));
      if (!hasCurrentTime) {
        currentTime += duration;
      } else {
        currentTime = time;
      }
    }
  };
  SegmentInformation.prototype.createFragmentFromUrlList = function (urlListNodes) {
    for (let i = 0; i < urlListNodes.length; i++) {
      const fragment = urlListNodes[i].attributes.getNamedItem("media").nodeValue;
      this.mediaUrls.push(new MediaUrl_1.MediaUrl(this.baseUrl, fragment, this.mimeType));
    }
  };
  SegmentInformation.prototype.createFragmentsFromTemplate = function () {
    const segmentDuration = parseInt(this.segmentTemplate.attributes.getNamedItem("duration").nodeValue);
    const segmentTimescale = (this.segmentTemplate.attributes.getNamedItem("timescale")) ? parseInt(
        this.segmentTemplate.attributes.getNamedItem("timescale").nodeValue) : 1;
    const numSegments = Math.ceil(this.presentationDuration / (segmentDuration / segmentTimescale) / 1000);
    const mediaTemplateStringSegment = this.mediaTemplate.split('$');
    let templateReplaceableIndex;
    const startNumber = this.startNumber || 0;
    for (let k = 0; k < mediaTemplateStringSegment.length; k++) {
      if (mediaTemplateStringSegment[k].indexOf('Number') != -1) {
        templateReplaceableIndex = '$' + mediaTemplateStringSegment[k] + '$';
      }
    }
    const paddingAmount = ZeroPadding_1.ZeroPadding.getPaddingAmount(templateReplaceableIndex);
    for (let i = startNumber; i < numSegments + startNumber; i++) {
      const segmentIndex = ZeroPadding_1.ZeroPadding.addPadding(i, paddingAmount);
      let fragment;
      if (paddingAmount === 0) {
        fragment = this.replace$Number$(this.mediaTemplate, i);
      } else {
        fragment = this.mediaTemplate.replace(templateReplaceableIndex, segmentIndex);
      }
      this.mediaUrls.push(new MediaUrl_1.MediaUrl(this.baseUrl, fragment, this.mimeType));
    }
  };
  SegmentInformation.prototype.replace$RepresentationID$ = function (fragment, id) {
    return fragment.replace(new RegExp('\\$RepresentationID\\$', 'g'), id);
  };
  SegmentInformation.prototype.replace$Number$ = function (fragment, num) {
    return fragment.replace(new RegExp('\\$Number\\$', 'g'), num.toString());
  };
  SegmentInformation.prototype.replace$Bandwidth$ = function (fragment, bandwidth) {
    return fragment.replace(new RegExp('\\$Bandwidth\\$', 'g'), bandwidth.toString());
  };
  SegmentInformation.prototype.replace$Time$ = function (fragment, currentIndex) {
    return fragment.replace(new RegExp('\\$Time\\$', 'g'), currentIndex.toString());
  };
  SegmentInformation.prototype.createInitSegment = function (fragment) {
    fragment = this.replace$Bandwidth$(fragment, this.bandwidth);
    fragment = this.replace$RepresentationID$(fragment, this.representationID);
    return fragment;
  };
  SegmentInformation.prototype.getMediaUrlList = function () {
    return this.mediaUrls;
  };
  SegmentInformation.count = -1;
  return SegmentInformation;
}());
exports.SegmentInformation = SegmentInformation;
