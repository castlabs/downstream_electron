"use strict";
const BASE64 = require('base64-js');

function createWidevinePssh (KID) {
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
}

module.exports = {
  createWidevinePssh: createWidevinePssh
}
