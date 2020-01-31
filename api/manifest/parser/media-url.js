"use strict";
const MediaUrl = (function () {
  function MediaUrl (baseURL, mediaFile, mimeType, url_domain) {
    if (url_domain === void 0) {
      url_domain = '';
    }
    this.baseURL = '';
    if (baseURL.startsWith('http') === false) {
      this.baseURL = baseURL;
    }
    this.mediaFile = (mediaFile.indexOf('/') !== -1) ? this.truncateMediaFilePath(mediaFile) : mediaFile;
    this.url_domain = url_domain;
    this.mimeType = mimeType;
  }

  MediaUrl.prototype.truncateMediaFilePath = function (mediaFile) {
    const startIndex = mediaFile.lastIndexOf('/');
    const front = mediaFile.substring(0, startIndex);
    const end = mediaFile.substring(startIndex + 1, mediaFile.length);
    this.baseURL += front;
    return end;
  };
  MediaUrl.prototype.getFileAddress = function () {
    return this.baseURL + this.mediaFile;
  };
  return MediaUrl;
}());
exports.MediaUrl = MediaUrl;
