"use strict";
const FlakeIdGen = require("flake-idgen");
const intFormat = require("biguint-format");
const generator = new FlakeIdGen;
const SnowflakeId = (function () {
  function SnowflakeId () {
  }

  SnowflakeId.getUUID = function () {
    const id1 = generator.next();
    const id3 = intFormat(id1, 'dec');
    return id3;
  };
  return SnowflakeId;
}());
exports.SnowflakeId = SnowflakeId;
