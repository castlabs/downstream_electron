"use strict";
const BASE64 = require('base64-js');
const pssh = require("./pssh");
const MPEG_DASH_PROTECTION_SCHEME_ID_URI = 'urn:mpeg:dash:mp4protection:2011';
const WIDEVINE_SCHEME_ID_URI = 'urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed';

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
const RepresentationNode_1 = require("./representation-node");
const AdaptationSetNode = (function (_super) {
  __extends(AdaptationSetNode, _super);
  function AdaptationSetNode (node, xml) {
    _super.call(this, node, xml);
    this.representationColl = [];
    this.contentProtections = [];
    this.parse();
  }

  AdaptationSetNode.prototype.parse = function () {
    const rep = this.currentNode.getElementsByTagName('Representation');
    for (let i = 0; i < rep.length; i++) {
      const repNode = new RepresentationNode_1.RepresentationNode(rep[i], this.xml);
      this.representationColl[i] = repNode;
      if (this.representationColl[0].hasMimeType()) {
        {
          this.attributeList['mimeType'] = this.representationColl[0].getMimeType();
        }
      }
    }

    const contentProtections = this.currentNode.getElementsByTagName('ContentProtection');

    let KID;
    // find CENC KEY ID if there is some
    for (let i = 0; i < contentProtections.length; i++) {
      let attrs = contentProtections[i].attributes;
      let schemeIdUri = attrs.getNamedItem("schemeIdUri");
      if (schemeIdUri && schemeIdUri.value.toLowerCase() === MPEG_DASH_PROTECTION_SCHEME_ID_URI) {
        if (attrs.getNamedItem("cenc:default_KID")) {
          KID = attrs.getNamedItem("cenc:default_KID").value;
          // Get KID (base64 decoded) as byte array
          KID = BASE64.toByteArray(KID);
          break;
        }
      }
    }

    for (let i = 0; i < contentProtections.length; i++) {
      const attrs = contentProtections[i].attributes;
      if (attrs.getNamedItem("schemeIdUri")) {
        const scheme = attrs.getNamedItem("schemeIdUri").value.toLowerCase();
        const cenc = contentProtections[i].getElementsByTagName("cenc:pssh");
        if (cenc.length) {
          const contentProtection = {
            schemeIdUri: scheme,
            cencPSSH: cenc[0].childNodes[0].data
          };
          this.contentProtections.push(contentProtection);
        } else if (KID && scheme === WIDEVINE_SCHEME_ID_URI) {
          const psshWV = pssh.createWidevinePssh(KID);
          const contentProtection = {
            schemeIdUri: scheme,
            cencPSSH: psshWV
          };
          this.contentProtections.push(contentProtection);
        }
      }
    }
  };

  AdaptationSetNode.prototype.getContentProtections = function () {
    return this.contentProtections;
  };

  AdaptationSetNode.prototype.getWidevineProtection = function () {
    return this.contentProtections.filter(function (item) {
      return item.schemeIdUri && item.schemeIdUri.toLowerCase() === WIDEVINE_SCHEME_ID_URI;
    });
  };

  AdaptationSetNode.prototype.isMimeType = function (str) {
    return this.attributeList['mimeType'].indexOf(str) != -1 ? true : false;
  };

  AdaptationSetNode.prototype.isContentType = function (str) {
    return this.attributeList['contentType'] && this.attributeList['contentType'].indexOf(str) != -1 ? true : false;
  };
  return AdaptationSetNode;
}(ManifestNode_1.ManifestNode));
exports.AdaptationSetNode = AdaptationSetNode;
