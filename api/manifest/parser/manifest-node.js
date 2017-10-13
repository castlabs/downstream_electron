"use strict";
const SnowflakeId_1 = require("../../util/snowflake-id");
const ManifestNode = (function () {
  function ManifestNode (node, xml) {
    this.childCollection = [];
    this.attributeList = {};
    this.setCurrentNode(node);
    this.setChildCollection(node.childNodes);
    this.buildAttributeList(node, this.attributeList);
    this.setParentNode(node.parentNode);
    this.xml = xml;
    this.id = SnowflakeId_1.SnowflakeId.getUUID();
  }

  ManifestNode.prototype.setParentNode = function (node) {
    this.parentNode = node;
  };
  ManifestNode.prototype.setChildCollection = function (coll) {
    this.childCollection = coll;
  };
  ManifestNode.prototype.setCurrentNode = function (node) {
    this.currentNode = node;
  };
  ManifestNode.prototype.buildAttributeList = function (node, list) {
    this.writeAttributesToList(node, list);
  };
  ManifestNode.prototype.writeAttributesToList = function (node, list) {
    const attrList = node.attributes;
    for (let attr in attrList) {
      if (!list[attrList[attr].nodeName]) {
        list[attrList[attr].nodeName] = attrList[attr].nodeValue;
      }
    }
    if (node.parentNode !== null) {
      this.buildAttributeList(node.parentNode, list);
    }
  };
  ManifestNode.prototype.getCurrentNode = function () {
    return this.currentNode;
  };
  ManifestNode.prototype.markNodeForDownload = function (value) {
    const newAtt = this.xml.createAttribute('markForDownload');
    if (!value) {
      this.currentNode.removeAttribute('markForDownload');
    } else {
      newAtt.value = value.toString();
      this.currentNode.setAttributeNode(newAtt);
    }
  };
  ManifestNode.prototype.getAttributeList = function () {
    return this.attributeList;
  };
  return ManifestNode;
}());
exports.ManifestNode = ManifestNode;
