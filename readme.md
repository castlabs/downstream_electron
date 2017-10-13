# Downstream For Electron 

## Development
1. `npm install`
2. `npm start`

## Build
1. `npm install`
2. edit `index.js` and change line to use `downstream-electron-be` from `build` folder
3. edit `examples/main/index.js` and change line to use `downstream-electron-fe` from `build` folder
4. `npm run build`
5. `npm start`

## Documentation 
1. `npm run jsdoc`
2. Open `jsdoc/index.html` in any browser
3. If you want to generate docs with private methods run `npm run jsdoc_prv`

## ESLint 
1. `npm run eslint`

## Debugging in intellij / webstorm
1. Create new node.js configuration
2. Node interpreter: `/node_modules/.bin/electron`
3. Javascript file: `index.js`

## License
Copyright (C) 2017 Castlabs GmbH.
Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
