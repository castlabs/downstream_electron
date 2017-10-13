"use strict";
const AllAdaptationSets = (function () {
  function AllAdaptationSets (vid, audio, text) {
    this.videoAdaptation = vid;
    if (audio) {
      this.audioAdaptation = audio;
    }
    if (text) {
      this.textAdaptation = text;
    }
  }

  return AllAdaptationSets;
}());
exports.AllAdaptationSets = AllAdaptationSets;
