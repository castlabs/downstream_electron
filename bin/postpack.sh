#!/bin/bash

sed -i.bak 's/dist\/index.js/app.js/g' package.json
rm -f package.json.bak

