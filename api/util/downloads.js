"use strict";

/**
 * @module
 * @namespace downloadUtil
 */
let downloadUtil = {};

/**
 * @typedef {Link} Link
 * @property {string} id - identifier
 * @property {number} bandwidth - bandwidth
 * @property {string} contentType - content type [video, audio, text]
 * @property {string} remoteUrl - remote url
 * @property {string} localUrl - local url
 */

/**
 * @param {string} manifestId - manifest identifier
 * @param {string} localPath - local path
 * @param {string} remotePath - remote path
 * @param {array} userRepresentations - representations chosen by a user
 * @param {array} manifestRepresentations - all manifest representations
 * @param {string} downloadedHash - download unique identifier
 * @returns {Link[]} array of {@link Link}
 */
downloadUtil.getDownloadLinks = function getDownloadLinks (manifestId, localPath, remotePath, userRepresentations,
                                                           manifestRepresentations, downloadedHash) {
  let chosenRepresentations = downloadUtil.getChosenRepresentations(userRepresentations, manifestRepresentations);
  let bandwidth, contentType, localUrl, i, id, j, k, l, links;
  let mediaFile, mediaBaseUrl, mediaUrls, remoteUrl, segmentInformation;

  links = [];
  downloadedHash = downloadedHash || {};
  for (i = 0, j = chosenRepresentations.length; i < j; i++) {
    contentType = chosenRepresentations[i].attributeList.mimeType;
    bandwidth = +chosenRepresentations[i].attributeList.bandwidth;
    if (contentType.indexOf("video") === 0) {
      contentType = "video";
    } else if (contentType.indexOf("audio") === 0) {
      contentType = "audio";
    } else {
      contentType = "text";
    }
    segmentInformation = chosenRepresentations[i].segmentInformation;
    mediaUrls = segmentInformation.mediaUrls;
    id = segmentInformation.representationID;
    for (k = 0, l = mediaUrls.length; k < l; k++) {
      mediaFile = mediaUrls[k].mediaFile;
      mediaBaseUrl = mediaUrls[k].baseURL;
      mediaBaseUrl = mediaBaseUrl.replace(/\.\.\//g, "");
      mediaBaseUrl = mediaBaseUrl.replace(/\.\./g, "");
      if (mediaFile === mediaBaseUrl) {
        mediaBaseUrl = "";
      } else if (mediaBaseUrl && mediaBaseUrl[mediaBaseUrl.length - 1] !== "/") {
        mediaBaseUrl += "/";
      }
      if (remotePath === mediaBaseUrl) {
        mediaBaseUrl = '';
      }
      remoteUrl = remotePath + mediaBaseUrl + mediaFile;
      localUrl = localPath + mediaBaseUrl + mediaFile;
      if ((!downloadedHash[localUrl]) || (!downloadedHash[localUrl] && downloadedHash[localUrl].remoteUrl !== remoteUrl)) {
        links.push({
          id: id,
          bandwidth: bandwidth,
          contentType: contentType,
          remoteUrl: remoteUrl,
          localUrl: localUrl
        });
      }
    }
  }
  return links;
};

/**
 *
 * @param {array} userChosenRepr - array of chosen representations ids by user
 * @param {array} manifestRepr - array of all manifest representations
 * @returns {array} chosen representations from manifest
 */
downloadUtil.getChosenRepresentations = function getChosenRepresentations (userChosenRepr, manifestRepr) {
  let chosenRepresentations = [];
  let userChosenReprObj = {};
  userChosenRepr = userChosenRepr || [];
  manifestRepr = manifestRepr || [];
  for (let i = 0, j = userChosenRepr.length; i < j; i++) {
    userChosenReprObj[String(userChosenRepr[i])] = true;
  }
  for (let i = 0, j = manifestRepr.length; i < j; i++) {
    const items = manifestRepr[i].representationColl;
    for (let k = 0, l = items.length; k < l; k++) {
      const item = items[k];
      if (userChosenReprObj[String(item.attributeList.id)]) {
        chosenRepresentations.push(item);
      }
    }
  }
  return chosenRepresentations;
};

module.exports = downloadUtil;
