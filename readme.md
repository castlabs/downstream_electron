# DOWNstream For Electron [![Build Status](https://travis-ci.org/castlabs/downstream_electron.svg?branch=master)](https://travis-ci.org/castlabs/downstream_electron)

## Summary

DOWNstream is an open-source plugin to use with Electron allowing encrypted MPEG-DASH and Smooth Streaming streams to be safely downloaded and stored locally on a user’s Windows or Mac computer.

## castLabs Electron Release for Content Security

To simplify the use of Widevine DRM and allow protected playback of offline content within Electron castLabs has created a fork with support for Widevine CDM installation, Verified Media Path (VMP), and protected storage of offline licenses. Such a release is installed by the default npm package scripts, see [Development](#development) and [Build](#build) sections below.

More information is available here:

https://github.com/castlabs/electron-releases

## Development

1. *(optional)* `npm run clean`
2. `npm install`
3. `npm start`

## Build

1. `npm install`
2. `npm run build`
3. `npm start`

## Examples

1. `npm install`
2. `npm start -- example=`*name*

- (*default*) Example: **main**

Extended example showing most of the features of the **downstream_electron** library

- Example: **drm**

Basic example presenting usage of DRM protected stream with **downstream_electron** library

## Integrations

### Redux

Directory `integrations/redux` contains a full example of integration **downstream_electron**
with React & Redux frameworks.

#### Development

1. `cd integrations/redux`
2. `npm install`
3. `npm run dev`

#### Release

1. `cd integrations/redux`
2. `npm install`
3. `npm run dist`

## Documentation

Documentation is available publicly at 
https://castlabs.github.io/downstream_electron/

1. `npm run jsdoc`
2. Open `jsdoc/index.html` in any browser
3. If you want to generate docs with private methods run `npm run jsdoc_prv`

## ESLint

1. `npm run eslint`

## Debugging in intellij / webstorm

1. Create new node.js configuration
2. Node interpreter: `/node_modules/.bin/electron`
3. Javascript file: `index.js`

## More information

https://castlabs.com/open-source/downstream/

## License

Copyright (C) 2017 Castlabs GmbH.
Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
