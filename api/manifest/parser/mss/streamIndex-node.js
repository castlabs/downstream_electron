"use strict";
const BASE64 = require('base64-js');
const DOMParser = require('xmldom').DOMParser;

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
const AdaptationSetNode_1 = require("../adaptation-set-node");
const QualityLevelNode_1 = require("./qualityLevel-node");

const StreamIndexNode = (function (_super) {
  __extends(StreamIndexNode, _super);
  function StreamIndexNode (node, xml) {
    _super.call(this, node, xml);
  }

  StreamIndexNode.prototype.parse = function () {

    let qualityLevels = this.currentNode.getElementsByTagName('QualityLevel');

    for (let i = 0; i < qualityLevels.length; i++) {
      const qualityLevelNode = new QualityLevelNode_1.QualityLevelNode(qualityLevels[i], this.xml);
      this.representationColl[i] = qualityLevelNode;
      if (this.representationColl[0].hasMimeType()) {
          this.attributeList['mimeType'] = this.representationColl[0].getMimeType();
      }
      if (this.representationColl[0].hasContentType()) {
        this.attributeList['mimeType'] = this.representationColl[0].getContentType();
      }
    }

    const protection = this.xml.getElementsByTagName('Protection')[0];

    if (protection !== undefined) {
      const protectionHeader = protection.getElementsByTagName('ProtectionHeader')[0];
      // Some packagers put newlines into the ProtectionHeader base64 string, which is not good
      // because this cannot be correctly parsed. Let's just filter out any newlines found in there.
      const psshPR = protectionHeader.firstChild.data.replace(/\n|\r/g, '');

      // Get KID (in CENC format) from protection header
      const KID = this.getKIDFromProtectionHeader(protectionHeader);

      // Create ContentProtection for PlayReady
      const cpPR = {
        schemeIdUri: "urn:uuid:9a04f079-9840-4286-ab92-e65be0885f95",
        cencPSSH: psshPR
      };
      this.contentProtections.push(cpPR);

      // Create ContentProtection for Widevine (as a CENC protection)
      const psshWV = this.createWidevinePssh(KID);
      const cpWV = {
        schemeIdUri: "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed",
        cencPSSH: psshWV
      };
      this.contentProtections.push(cpWV);
    }
  }

  StreamIndexNode.prototype.getKIDFromProtectionHeader = function (protectionHeader) {
      let prHeader,
          wrmHeader,
          xmlReader,
          KID;

      // Get PlayReady header as byte array (base64 decoded)
      prHeader = BASE64.toByteArray(protectionHeader.firstChild.data);

      // Get Right Management header (WRMHEADER) from PlayReady header
      wrmHeader = this.getWRMHeaderFromPRHeader(prHeader);

      // Convert from multi-byte to unicode
      wrmHeader = new Uint16Array(wrmHeader.buffer);

      // Convert to string
      wrmHeader = String.fromCharCode.apply(null, wrmHeader);

      // Parse <WRMHeader> to get KID field value
      xmlReader = (new DOMParser()).parseFromString(wrmHeader, 'application/xml');
      KID = xmlReader.getElementsByTagName('KID')[0].textContent;

      // Get KID (base64 decoded) as byte array
      KID = BASE64.toByteArray(KID);

      // Convert UUID from little-endian to big-endian
      this.convertUuidEndianness(KID);

      return KID;
  };

  StreamIndexNode.prototype.convertUuidEndianness = function (uuid) {
      this.swapBytes(uuid, 0, 3);
      this.swapBytes(uuid, 1, 2);
      this.swapBytes(uuid, 4, 5);
      this.swapBytes(uuid, 6, 7);
  };

  StreamIndexNode.prototype.swapBytes = function (bytes, pos1, pos2) {
      let temp = bytes[pos1];
      bytes[pos1] = bytes[pos2];
      bytes[pos2] = temp;
  };

  StreamIndexNode.prototype.getWRMHeaderFromPRHeader = function getWRMHeaderFromPRHeader (prHeader) {
    let recordType,
        recordLength,
        recordValue;
    let i = 0;

    // Parse PlayReady header

    // Length - 32 bits (LE format)
    // var length = (prHeader[i + 3] << 24) + (prHeader[i + 2] << 16) + (prHeader[i + 1] << 8) + prHeader[i];
    i += 4;

    // Record count - 16 bits (LE format)
    // var recordCount = (prHeader[i + 1] << 8) + prHeader[i];
    i += 2;

    // Parse records
    while (i < prHeader.length) {
        // Record type - 16 bits (LE format)
        recordType = (prHeader[i + 1] * 256) + prHeader[i];
        i += 2;

        // Check if Rights Management header (record type = 0x01)
        if (recordType === 0x01) {

            // Record length - 16 bits (LE format)
            recordLength = (prHeader[i + 1] * 256) + prHeader[i];
            i += 2;

            // Record value => contains <WRMHEADER>
            recordValue = new Uint8Array(recordLength);
            recordValue.set(prHeader.subarray(i, i + recordLength));
            return recordValue;
        }
    }
    return null;
  };

  StreamIndexNode.prototype.createWidevinePssh = function (KID) {
    // Create Widevine CENC header (Protocol Buffer) with KID value
    var wvCencHeader = new Uint8Array(2 + KID.length);
    wvCencHeader[0] = 0x12;
    wvCencHeader[1] = 0x10;
    wvCencHeader.set(KID, 2);

    // Create a pssh box
    var length = 12 /* box length, type, version and flags */ + 16 /* SystemID */ + 4 /* data length */ + wvCencHeader.length,
        pssh = new Uint8Array(length),
        i = 0;

    // Set box length value (4 bytes)
    pssh[i++] = 0;
    pssh[i++] = 0;
    pssh[i++] = 0;
    pssh[i++] = length;

    // Set type ('pssh'), version (0) and flags (0)
    pssh.set([0x70, 0x73, 0x73, 0x68, 0x00, 0x00, 0x00, 0x00], i);
    i += 8;

    // Set SystemID ('edef8ba9-79d6-4ace-a3c8-27dcd51d21ed')
    pssh.set([0xed, 0xef, 0x8b, 0xa9,  0x79, 0xd6, 0x4a, 0xce, 0xa3, 0xc8, 0x27, 0xdc, 0xd5, 0x1d, 0x21, 0xed], i);
    i += 16;

    // Set data length value
    pssh[i++] = 0;
    pssh[i++] = 0;
    pssh[i++] = 0;
    pssh[i++] = wvCencHeader.length;

    // Copy Widevine CENC header
    pssh.set(wvCencHeader, i);

    // Convert to BASE64 string
    pssh = BASE64.fromByteArray(pssh);
    return pssh;
  };
  return StreamIndexNode;
}(AdaptationSetNode_1.AdaptationSetNode));
exports.StreamIndexNode = StreamIndexNode;
