#!/usr/bin/env bash
npm run jsdoc
rm -rf gh-pages
# TODO change the link once travis or anything else is set up correctly
#git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/castlabs/downstream_electron gh-pages > /dev/null
git clone --quiet --branch=gh-pages git@github.com:castlabs/downstream_electron.git gh-pages > /dev/null
cd gh-pages
git rm -rf ./docs
git rm -rf ./fonts
git rm -rf ./scripts
git rm -rf ./styles
git rm -rf *.html
cp -r ../jsdoc/ .
git add .
#git commit --amend -m "Latest documentation on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
git commit --amend -m "Latest documentation"
git push -fq origin gh-pages > /dev/null
cd ..
rm -rf gh-pages