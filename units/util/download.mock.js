var lastId = 0;

function ManifestRepresentation () {
  this.representationColl = [];
  this.add = function (attributeList, segmentInformation) {
    this.representationColl.push(new RepresentationColl(attributeList, segmentInformation));
  };
  this.getIds = function () {
    return this.representationColl.map(function (representationColl) {
      return representationColl.attributeList.id;
    });
  };
}

function RepresentationColl (attributeList, segmentInformation) {
  this.attributeList = attributeList || {};
  this.segmentInformation = segmentInformation;
  this.segmentInformation.representationID = attributeList.id;
}

function SegmentInformation () {
  this.representationID = null;
  this.mediaUrls = [];
  this.add = function (mediaFile, baseURL) {
    this.mediaUrls.push(new MediaUrl(mediaFile, baseURL));
  };
}

function MediaUrl (mediaFile, baseURL) {
  this.mediaFile = mediaFile;
  this.baseURL = baseURL;
}

function mockManifestRepr (info, values) {
  var manifestRepresentation = new ManifestRepresentation();
  const segmentInformation = new SegmentInformation();
  var i, j;
  for (i = 0, j = values.length; i < j; i++) {
    segmentInformation.add(values[i].mediaFile, values[i].baseURL);
  }
  lastId++;
  manifestRepresentation.add({
    id: lastId,
    mimeType: info.type,
    bandwidth: info.bandwidth
  }, segmentInformation);
  return manifestRepresentation;
}

function addMock (manifestRepresentations, userRepresentations, info, values) {
  const mock = mockManifestRepr(info, values);
  manifestRepresentations.push(mock);
  mock.getIds().forEach(function (id) {
    userRepresentations.push(id);
  });
}

exports.addMock = addMock;