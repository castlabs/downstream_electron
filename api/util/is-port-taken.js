"use strict";
const net = window.require("net");

module.exports = function (port, fn) {
  const tester = net.createServer().once('error', function (err) {
    if (err) {
      return fn(err);
    }
    fn(null, true);
  }).once('listening', function () {
    tester.once('close', function () {
      fn(null, false);
    }).close();
  }).listen(port);
};
