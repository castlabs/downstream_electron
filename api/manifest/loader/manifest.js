"use strict";
const ManifestLoader = require("./manifest-loader");
const ManifestLocalLoader = require("./manifest-local-loader");
// const ManifestXML_1 = require("./../parser/manifest-xml");
const ManifestXML_1 = require("./../parser/mss/manifest-xml");
const AllAdaptationSets_1 = require("../parser/all-adaptation-sets");
const SnowflakeId_1 = require("../../util/snowflake-id");
const jsonRepresentation = require("../parser/json-representation");
const jsonRepresentationWithProtection = require("../parser/json-representation-with-protection");
const manifestLoader = new ManifestLoader.ManifestLoader();
const urlParse = require("url-parse");
const encoding = require("../../util/encoding");

const Manifest = (function () {
  function Manifest (id) {
    if (!id) {
      this.id = String(SnowflakeId_1.SnowflakeId.getUUID());
    } else {
      this.id = id;
    }
  }

  Manifest.prototype._setUpUrl = function (url) {
    const pathName = urlParse(url).pathname;
    this.url = url;
    this.url_domain = url.substring(0, url.lastIndexOf('/') + 1);
    this.manifest_name = pathName.substring(pathName.lastIndexOf('/') + 1, pathName.length);
  };

  Manifest.prototype.load = function (url) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this._setUpUrl(url);
      const p = manifestLoader.load(url);
      p.then(function (v) {
        var isEncodingUTF16 = encoding.isUTF16(v.response);
        v.response = v.response.toString(isEncodingUTF16 ? 'utf16le' : 'utf-8');
        const xml = v.response;
        _this.manifestXML = new ManifestXML_1.ManifestXML();
        _this.manifestXML.parse(xml, function () {
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
      if (!url || !localPath) {
        reject('wrong parameter');
        return;
      }
      ManifestLocalLoader(localPath).then(function (str) {
        _this._setUpUrl(url);
        _this.manifestXML = new ManifestXML_1.ManifestXML();
        _this.manifestXML.parse(str, function () {
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
    this.manifestXML = new ManifestXML_1.ManifestXML();
    this.manifestXML.parse(str);
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
    return this.url;
  };
  Manifest.prototype.getManifestXML = function () {
    return this.manifestXML.getManifestXML();
  };
  Manifest.prototype.removeNode = function () {
    this.manifestXML.removeNode();
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
