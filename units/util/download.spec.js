var downloadsUtil = require("../../api/util/downloads.js");
var downloadsMock = require("./download.mock");

describe("util/downloads.js", function () {
  let manifestId, localPath, remotePath, userRepresentations, manifestRepresentations, downloadedHash, baseURL;
  beforeEach(function () {
    manifestId = "";
    localPath = "c:\\foo";
    remotePath = "https://foo.bar.com";
    userRepresentations = [];
    manifestRepresentations = [];
    downloadedHash = {};
    baseURL = "https://foo.bar.com";
  });
  it("should have 6 links, 4 video and 2 audio", function () {
    downloadsMock.addMock(manifestRepresentations, userRepresentations, {
      type: "video",
      bandwidth: 128000
    }, [
      {
        mediaFile: "video1_1",
        baseURL: baseURL
      },
      {
        mediaFile: "video1_2",
        baseURL: baseURL
      }
    ]);
    downloadsMock.addMock(manifestRepresentations, userRepresentations, {
      type: "video",
      bandwidth: 256000
    }, [
      {
        mediaFile: "video2_1",
        baseURL: baseURL
      },
      {
        mediaFile: "video2_2",
        baseURL: baseURL
      }
    ]);
    downloadsMock.addMock(manifestRepresentations, userRepresentations, {
      type: "audio",
      bandwidth: 48000
    }, [
      {
        mediaFile: "audio1_1",
        baseURL: baseURL
      },
      {
        mediaFile: "audio1_2",
        baseURL: baseURL
      }
    ]);

    let downloadLinks = downloadsUtil.getDownloadLinks(manifestId, localPath, remotePath, userRepresentations,
      manifestRepresentations, downloadedHash);

    expect(downloadLinks.length).toEqual(6);
    expect(downloadLinks.filter(function (d) {return d.contentType === "video";}).length).toEqual(4);
    expect(downloadLinks.filter(function (d) {return d.contentType === "audio";}).length).toEqual(2);
    var link = downloadLinks[0];
    expect(link.id).toEqual(1);
    expect(link.bandwidth).toEqual(128000);
    expect(link.contentType).toEqual("video");
    expect(link.remoteUrl).toEqual("https://foo.bar.com/video1_1");
    expect(link.localUrl).toEqual("c:\\foo/video1_1");
  });

  describe("when mediaFile is the same as baseURL", function () {
    it("should generate correct link", function () {
      downloadsMock.addMock(manifestRepresentations, userRepresentations, {
        type: "audio",
        bandwidth: 48000
      }, [
        {
          mediaFile: "foo.mpd",
          baseURL: "foo.mpd"
        }
      ]);
      let downloadLinks = downloadsUtil.getDownloadLinks(manifestId, localPath, remotePath, userRepresentations,
        manifestRepresentations, downloadedHash);
      var link = downloadLinks[0];
      expect(link.remoteUrl).toEqual("https://foo.bar.com/foo.mpd");
    });
  });
  describe("when baseURL is the same as remotePath", function () {
    it("should generate correct link", function () {
      downloadsMock.addMock(manifestRepresentations, userRepresentations, {
        type: "audio",
        bandwidth: 48000
      }, [
        {
          mediaFile: "foo.mpd",
          baseURL: "https://foo.bar.com"
        }
      ]);
      let downloadLinks = downloadsUtil.getDownloadLinks(manifestId, localPath, remotePath, userRepresentations,
        manifestRepresentations, downloadedHash);
      var link = downloadLinks[0];
      expect(link.remoteUrl).toEqual("https://foo.bar.com/foo.mpd");
    });
  });
  describe("when baseURL is full path", function () {
    it("should generate correct link", function () {
      downloadsMock.addMock(manifestRepresentations, userRepresentations, {
        type: "audio",
        bandwidth: 48000
      }, [
        {
          mediaFile: "foo.mpd",
          baseURL: "http://foo2.bar.com"
        }
      ]);
      let downloadLinks = downloadsUtil.getDownloadLinks(manifestId, localPath, remotePath, userRepresentations,
        manifestRepresentations, downloadedHash);
      var link = downloadLinks[0];
      expect(link.remoteUrl).toEqual("http://foo2.bar.com/foo.mpd");
      expect(link.localUrl).toEqual("c:\\foo/foo2.bar.com/foo.mpd");
    });
  });
  describe("when baseURL is a path of path", function () {
    it("should generate correct link", function () {
      downloadsMock.addMock(manifestRepresentations, userRepresentations, {
        type: "audio",
        bandwidth: 48000
      }, [
        {
          mediaFile: "foo.mpd",
          baseURL: "castlabs"
        }
      ]);
      let downloadLinks = downloadsUtil.getDownloadLinks(manifestId, localPath, remotePath, userRepresentations,
        manifestRepresentations, downloadedHash);
      var link = downloadLinks[0];
      expect(link.remoteUrl).toEqual("https://foo.bar.com/castlabs/foo.mpd");
      expect(link.localUrl).toEqual("c:\\foo/castlabs/foo.mpd");
    });
  });
  describe("when link is already downloaded", function () {
    it("should not generate a new link", function () {
      downloadsMock.addMock(manifestRepresentations, userRepresentations, {
        type: "audio",
        bandwidth: 48000
      }, [
        {
          mediaFile: "foo.mpd",
          baseURL: "castlabs"
        }
      ]);
      downloadedHash = {"c:\\foo/castlabs/foo.mpd": true};
      let downloadLinks = downloadsUtil.getDownloadLinks(manifestId, localPath, remotePath, userRepresentations,
        manifestRepresentations, downloadedHash);
      expect(downloadLinks.length).toEqual(0);
    });
  });
});