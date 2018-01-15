"use strict";
const ManifestLoader = require("./manifest-loader");
const ManifestLocalLoader = require("./manifest-local-loader");
const ManifestXML_1 = require("./../parser/manifest-xml");
const AllAdaptationSets_1 = require("../parser/all-adaptation-sets");
const SnowflakeId_1 = require("../../util/snowflake-id");
const jsonRepresentation = require("../parser/json-representation");
const jsonRepresentationWithProtection = require("../parser/json-representation-with-protection");
const manifestLoader = new ManifestLoader.ManifestLoader();
const urlParse = require("url-parse");
const Manifest = (function () {
  function Manifest (id) {
    if (!id) {
      this.id = String(SnowflakeId_1.SnowflakeId.getUUID());
    } else {
      this.id = id;
    }
  }

  Manifest.prototype.isUTF16 = function(data) {
    var i = 0;
    var len = data && data.length;
    var pos = null;
    var b1, b2, next, prev;

    if (len < 2) {
        if (data[0] > 0xFF) {
            return false;
        }
    } else {
        b1 = data[0];
        b2 = data[1];
        if (b1 === 0xFF && // BOM (little-endian)
            b2 === 0xFE) {
            return true;
        }
        if (b1 === 0xFE && // BOM (big-endian)
            b2 === 0xFF) {
            return true;
        }

        for (; i < len; i++) {
            if (data[i] === 0x00) {
                pos = i;
                break;
            } else if (data[i] > 0xFF) {
                return false;
            }
        }

        if (pos === null) {
            return false; // Non ASCII
        }

        next = data[pos + 1]; // BE
        if (next !== void 0 && next > 0x00 && next < 0x80) {
            return true;
        }

        prev = data[pos - 1]; // LE
        if (prev !== void 0 && prev > 0x00 && prev < 0x80) {
            return true;
        }
    }

    return false;
};

  Manifest.prototype.load = function (url) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      const pathName = urlParse(url).pathname;
      _this.url = url;
      _this.url_domain = url.substring(0, url.lastIndexOf('/') + 1);
      _this.manifest_name = pathName.substring(pathName.lastIndexOf('/') + 1, pathName.length);
      const p = manifestLoader.load(url);
      p.then(function (v) {
        var isEncodingUTF16 = _this.isUTF16(v.response);
        v.response = v.response.toString(isEncodingUTF16 ? 'utf16le' : 'utf-8');
        const xml = v.response;
        _this.manifestXML = new ManifestXML_1.ManifestXML(xml, function () {
          resolve();
        }, function (e) {
          reject(e);
          throw new Error("Manifest parsing error");
        });
      }, function (e) {
        reject(e);
      });
    });
  };

  Manifest.prototype.loadFromLocal = function (localPath, url) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      ManifestLocalLoader(localPath).then(function (str) {
        _this.url_domain = url.substring(0, url.lastIndexOf('/') + 1);
        _this.manifest_name = url.substring(url.lastIndexOf('/') + 1, url.length);
        _this.manifestXML = new ManifestXML_1.ManifestXML(str, function () {
          resolve();
        }, function (e) {
          reject(e);
        });
      }, function (e) {
        reject(e);
      });
    });

  };

  Manifest.prototype.loadFromStr = function (str, url) {
    this.url_domain = url.substring(0, url.lastIndexOf('/') + 1);
    this.manifest_name = url.substring(url.lastIndexOf('/') + 1, url.length);
    this.manifestXML = new ManifestXML_1.ManifestXML(str);
  };

  Manifest.prototype.getAdaptationSets = function () {
    const vid = this.manifestXML.getVideoAdaptation();
    const audio = this.manifestXML.getAudioAdaptation();
    const text = this.manifestXML.getTextAdaptation();
    const all = new AllAdaptationSets_1.AllAdaptationSets(vid, audio, text);
    return all;
  };
  Manifest.prototype.getVideoRepresentations = function () {
    return this.manifestXML.getVideoAdaptation();
  };
  Manifest.prototype.getAudioRepresentations = function () {
    return this.manifestXML.getAudioAdaptation();
  };
  Manifest.prototype.getTextRepresentations = function () {
    return this.manifestXML.getTextAdaptation();
  };
  Manifest.prototype.getProtections = function () {
    let protections = {};
    protections.video = jsonRepresentationWithProtection(this.getVideoRepresentations());
    protections.audio = jsonRepresentationWithProtection(this.getAudioRepresentations());
    protections.text = jsonRepresentationWithProtection(this.getTextRepresentations());
    return protections;
  };
  Manifest.prototype.getRemoteDomain = function () {
    return this.url_domain;
  };
  Manifest.prototype.getManifestName = function () {
    return this.manifest_name;
  };
  Manifest.prototype.getManifestUrl = function () {
    return this.url_domain + this.manifest_name;
  };
  Manifest.prototype.getManifestXML = function () {
    return this.manifestXML.getManifestXML();
  };
  Manifest.prototype.getJsonInfo = function () {
    let json = {};
    json.id = this.id;
    json.audio = jsonRepresentation(this.getAudioRepresentations());
    json.video = jsonRepresentation(this.getVideoRepresentations());
    json.text = jsonRepresentation(this.getTextRepresentations());
    json.protections = this.getProtections();
    return json;
  };
  return Manifest;
}());
exports.Manifest = Manifest;
