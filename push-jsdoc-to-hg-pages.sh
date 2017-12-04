#!/usr/bin/env bash
echo `pwd`
if [ "$TRAVIS_REPO_SLUG" == "castlabs/downstream_electron" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ] && [ "$TRAVIS_BRANCH" == "travis_test" ]; then

    echo -e "Publishing jsdoc...\n"
    echo `pwd`
    rm -rf gh-pages
    git clone --quiet --branch=gh-pages https://${GH_TOKEN}@github.com/castlabs/downstream_electron gh-pages > /dev/null
    cd gh-pages
    echo `pwd`
    git rm -rf ./fonts
    git rm -rf ./scripts
    git rm -rf ./styles
    git rm -rf *.html
    cd ..
    cp -r jsdoc/* gh-pages/
    cp -r build/* gh-pages/build/
    cd gh-pages
    git add -f .
    git commit --amend -m "Latest documentation on successful travis build $TRAVIS_BUILD_NUMBER auto-pushed to gh-pages"
    git push -fq origin gh-pages > /dev/null
#    cd ..
#    rm -rf gh-pages

    echo -e "Published jsdoc to gh-pages.\n"

fi

