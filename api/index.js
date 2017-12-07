// if you use webpack and you have problems that webpack includes both versions in main and renderer process
// please add this file to "noParse" option of you webpack
if (typeof window === 'undefined') {
  module.exports = require("./downstream-electron-be");
} else {
  module.exports = require("./downstream-electron-fe");
}