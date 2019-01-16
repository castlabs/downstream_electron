#!/bin/bash

sed -i.bak 's/index.js/app.js/g' package.json
rm -f package.json.bak
