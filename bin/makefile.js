#!/usr/bin/env node

function usage() {
    console.log('Usage: ' + __filename + ' prepack | postpack | clean');
    process.exit(-1);
}

if (process.argv.length <= 2) {
    usage();
}

const command = process.argv[2];
const fs = require('fs');
const packageFile = 'package.json';

if (command === 'prepack') {
    fs.readFile(packageFile, 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/api\/index\.js/g, 'index.js');
        result = result.replace(/"files": \[\s*"api"\s*\],\s*  /g, '');

        fs.writeFile(packageFile, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
} else if (command === 'postpack') {
    fs.readFile(packageFile, 'utf8', (err, data) => {
        if (err) {
            return console.log(err);
        }
        var result = data.replace(/index.js",/g, 'api/index.js",\n  "files": [\n    "api"\n  ],');
      
        fs.writeFile(packageFile, result, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    });
} else if (command === 'clean') {
    fs.unlink('index.js', (err) => {
        console.log('index.js is deleted');
    });
    fs.unlink('downstream-electron-be.js', (err) => {
        console.log('downstream-electron-be.js is deleted');
    });
    fs.unlink('downstream-electron-fe.js', (err) => {
        console.log('downstream-electron-fe.js is deleted');
    });
    fs.unlink('startServer.js', (err) => {
        console.log('startServer.js is deleted');
    });
} else {
    usage();
}
