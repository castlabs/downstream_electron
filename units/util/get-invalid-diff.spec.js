const getInvalidDiff = require("../../api/util/get-invalid-diff");
const appSettings = require("../../api/app-settings");

describe("util/get-invalid-diff.js", function () {
  let customManifestIdFolderRegex = appSettings.getSettings().customManifestIdFolderRegex;
  it("should validate for letters", function () {
    let customManifestId = "aa";
    expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
  });
  it("should validate for number only", function () {
    let customManifestId = 123;
    expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(String(customManifestId));
  });
  describe('first character', function () {
    it("should validate a number", function () {
      let customManifestId = '123';
      expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
    });
    it("should validate a letter", function () {
      let customManifestId = 'abc';
      expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
    });
    it("should validate character -", function () {
      let customManifestId = '-abc';
      expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
    });
    it("should validate character _", function () {
      let customManifestId = '_abc';
      expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
    });
    it("should validate character .", function () {
      let customManifestId = '.abc';
      expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).not.toEqual(customManifestId);
    });
  });
  it("should validate - mix of characters", function () {
    let customManifestId = 'abcąśćłÓN123!@#$%&*()-_+={}[];,.';
    expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
  });
  it("should NOT validate for forbidden characters", function () {
    let customManifestId = 'abc:"<>/?\|^~`£§';
    expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual("abc>:<>\"<><<>><>/<>?<>|<>^<>~<>`<£§");
  });
  it("should NOT validate for id longer then 51 characters", function () {
    let customManifestId = 'abcde12345abcde12345abcde12345abcde12345abcde12345';
    expect(getInvalidDiff(customManifestId, customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId);
    expect(getInvalidDiff(customManifestId + 'a', customManifestIdFolderRegex, ">", "<")).toEqual(customManifestId + '>a<');
  });
});