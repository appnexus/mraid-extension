#!/usr/bin/env bash

mkdir -p ./dist
node ./node_modules/browserify/bin/cmd.js -t sassify2 ./src/main.js | ./node_modules/uglify-js/bin/uglifyjs > ./dist/mraid.js
