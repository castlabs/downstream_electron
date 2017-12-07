#!/usr/bin/env bash
echo -e "Publishing jsdoc...\n"

PACKAGE_VERSION=$(node -p "require('./package.json').version")
rm -rf gh-pages
git clone --quiet --branch=gh-pages git@github.com:castlabs/downstream_electron.git gh-pages > /dev/null
cd gh-pages
git rm -rf ./build
git rm -rf ./fonts
git rm -rf ./scripts
git rm -rf ./styles
git rm -rf *.html
cd ..
cp -r jsdoc/* gh-pages/
cd gh-pages
git add -f .

git commit --amend -m "Latest documentation for version $PACKAGE_VERSION"
git push -fq origin gh-pages > /dev/null

echo -e "Published jsdoc to gh-pages for version $PACKAGE_VERSION\n"
