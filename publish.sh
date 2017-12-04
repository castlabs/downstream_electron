#!/usr/bin/env bash
npm install --only=dev
npm run jsdoc
npm run build
rm -rf gh-pages
git clone --quiet --branch=gh-pages git@github.com:castlabs/downstream_electron.git gh-pages > /dev/null
cd gh-pages
git rm -rf ./fonts
git rm -rf ./scripts
git rm -rf ./styles
git rm -rf *.html
cp -r ../jsdoc/ .
cp -r ../build/ ./build
git add .
git commit --amend -m "Latest documentation"
git push -fq origin gh-pages > /dev/null
cd ..
rm -rf gh-pages