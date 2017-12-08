#!/usr/bin/env bash
if ! git diff-index --quiet HEAD --; then
  echo ""
  echo "You have uncommitted changes, please commit them before continuing"
  echo ""
  echo "operation aborted"
  echo ""
  exit 0
fi

branch=`git rev-parse --abbrev-ref HEAD`
if [ "$branch" != "master" ]; then
  echo "You need to be on master branch"
  exit 0
fi

git fetch public master
git fetch public --tags

master_rev=`git rev-parse origin/master`
local_master_rev=`git rev-parse HEAD`

if [ "$master_rev" != "$local_master_rev" ]; then
  echo "Please sync your local repo with remote master"
  exit 0
fi

npm run travis-build || { echo "Build Failed, exiting" ; exit 0 ; }

echo "Build Successful, publishing to npm started ...";
version=$1
echo "version: $version"
if [ "$version" != "patch" ] && [ "$version" != "minor" ] && [ "$version" != "major" ]; then
    echo "You haven't chosen the version type, please add 'patch', 'minor' or 'major'";
    exit 0
fi
npm version "$version"
# build again so that it will have correct version inside
npm run travis-build
npm publish || { echo "Publishing failed" ; exit 0 ; }
git push origin master
git push origin --tags

echo "Publish to npm DONE with $version ";

sh ./push-jsdoc-to-hg-pages.sh