#!/usr/bin/env bash
if [ "$TRAVIS_REPO_SLUG" == "castlabs/downstream_electron" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "master" ]; then
    echo -e "Publishing jsdoc...\n"

    rm -rf gh-pages
    git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/castlabs/downstream_electron gh-pages > /dev/null
    cd gh-pages
    git rm -rf ./fonts
    git rm -rf ./scripts
    git rm -rf ./styles
    git rm -rf *.html
    mkdir build
    cd ..
    cp -r jsdoc/* gh-pages/
    cp -r build/* gh-pages/build/
    cd gh-pages

    git add -f .
    git commit --amend -m "Latest documentation on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
    git push -fq origin gh-pages > /dev/null

    echo -e "Published jsdoc to gh-pages.\n"
else
    echo -e "JSDoc not published until changes will be merged to master.\n"
fi

