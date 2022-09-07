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
if [ "$branch" != "main" ]; then
  echo "You need to be on main branch"
  exit 0
fi

git fetch public main
git fetch public --tags

main_rev=`git rev-parse origin/main`
local_main_rev=`git rev-parse HEAD`

if [ "$main_rev" != "$local_main_rev" ]; then
  echo "Please sync your local repo with remote main"
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
node ./bin/makefile.js prepack
npm publish || { echo "Publishing failed" ; exit 0 ; }
node ./bin/makefile.js postpack
git push origin main
git push origin --tags

echo "Publish to npm DONE with $version ";

sh ./push-jsdoc-to-hg-pages.sh