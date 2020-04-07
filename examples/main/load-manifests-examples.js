'use strict';
window.$ = window.jQuery = require('jquery');

function addExample (url) {
  const option = $('<option value="' + url + '">' + url + '</option>');
  $('#manifestUrlList').append(option[0]);
}

function addExamples () {
  const examples = [
    '-',
    'http://demo.unified-streaming.com/video/ateam/ateam.ism/ateam.mpd',
    'http://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
    'http://playready.directtaps.net/smoothstreaming/SSWSS720H264/SuperSpeedway_720.ism/Manifest',
    'http://playready.directtaps.net/smoothstreaming/SSWSS720H264PR/SuperSpeedway_720.ism/Manifest',
    'https://media.axprod.net/TestVectors/v7-Clear/Manifest.mpd'
  ];

  for (let i = 0, j = examples.length; i < j; i++) {
    addExample(examples[i]);
  }

  $('#manifestUrlList').on('change', function () {
    if (this.value !== '-') {
      $('#manifestUrl').val(this.value);
    } else {
      $('#manifestUrl').val("");
    }
  });
}

function addForm () {
  $("<form id='form'></form>").insertAfter($("#header"));
  $("#form").append($("<span>Custom manifest id (leave empty for auto)</span>"));
  $("#form").append($("<input type='text' style='width: 200px' id='customManifestId'>"));
  $("#form").append($("<br/>"));
  $("#form").append($("<span>Custom Folder (leave empty for auto)</span>"));
  $("#form").append($("<input type='text' style='width: 200px' id='customDownloadFolder'>"));
  $("#form").append($("<br/>"));
  $("#form").append($("<span>Manifest Url</span>"));
  $("#form").append($("<input type='text' style='width: 500px' id='manifestUrl'>"));
  $("#form").append($("<input type='submit' value='Submit'>"));
  $("#form").append($("<select type='text' style='width: 500px' id='manifestUrlList'></select>"));
}

function onLoad () {
  addForm();
  addExamples();
}

$(document).ready(onLoad);
