#!/usr/bin/env bash
echo "$TRAVIS_REPO_SLUG"
echo "$TRAVIS_PULL_REQUEST"
echo "$TRAVIS_BRANCH"

if [ "$TRAVIS_REPO_SLUG" == "castlabs/downstream_electron" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "travis_test" ]; then

    echo -e "Publishing jsdoc...\n"

    rm -rf gh-pages
    git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/castlabs/downstream_electron gh-pages > /dev/null
    cd gh-pages
    git rm -rf ./fonts
    git rm -rf ./scripts
    git rm -rf ./styles
    git rm -rf *.html
    cp -r ../jsdoc/ .
    cp -r ../build/ ./build
    git add .
    git commit --amend -m "Latest documentation on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
    git push -fq origin gh-pages > /dev/null
    cd ..
    rm -rf gh-pages

    echo -e "Published jsdoc to gh-pages.\n"

fi

