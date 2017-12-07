## DOWNstream For Electron [![Build Status](https://travis-ci.org/castlabs/downstream_electron.svg?branch=master)](https://travis-ci.org/castlabs/downstream_electron)
 
[DOWNstream](https://github.com/castlabs/downstream_electron) is an open-source plugin for use with Electron allowing encrypted MPEG-DASH streams to be safely downloaded and stored locally on a user’s Windows or Mac computer.

### Installation
```bash
  npm install downstream-electron --save
```

### Main process
  [DownstreamElectronBE](DownstreamElectronBE.html) 

### Renderer process
  [DownstreamElectronFE](DownstreamElectronFE.html) 


## castLabs Electron Release for Content Security

To simplify the use of Widevine DRM and allow protected playback of offline content within Electron CastLabs has created a fork with support for Widevine CDM installation, Verified Media Path (VMP), and protected storage of offline licenses. 
Such a release is installed by the default npm package scripts.

More information is available here:

https://github.com/castlabs/electron-releases


## License
Copyright (C) 2017 Castlabs GmbH.
Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
