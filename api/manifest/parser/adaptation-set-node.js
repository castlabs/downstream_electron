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
const RepresentationNode_1 = require("./representation-node");
const AdaptationSetNode = (function (_super) {
  __extends(AdaptationSetNode, _super);
  function AdaptationSetNode (node, xml) {
    _super.call(this, node, xml);
    this.representationColl = [];
    this.contentProtections = [];
    this.parse();
  }

  AdaptationSetNode.prototype.parse = function() {
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
    for (let i = 0; i < contentProtections.length; i++) {
      const attrs = contentProtections[i].attributes;
      const cenc = contentProtections[i].getElementsByTagName("cenc:pssh");
      if (attrs.getNamedItem("schemeIdUri") && cenc.length) {
        const contentProtection = {
          schemeIdUri: attrs.getNamedItem("schemeIdUri").value,
          cencPSSH: cenc[0].childNodes[0].data
        };
        this.contentProtections.push(contentProtection);
      }
    }
  };

  AdaptationSetNode.prototype.getContentProtections = function () {
    return this.contentProtections;
  };

  AdaptationSetNode.prototype.getWidevineProtection = function () {
    return this.contentProtections.filter(function (item) {
      return item.schemeIdUri === "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed";
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
