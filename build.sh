#!/usr/bin/env bash

# the mraid.js polyfill
node ./node_modules/browserify/bin/cmd.js -t sassify2 ./src/polyfill/main.js | ./node_modules/uglify-js/bin/uglifyjs > ./dist/mraid.js

# the chrome extension
mkdir -p ./dist/chrome
cp -R ./src/extension/chrome ./dist/
node ./node_modules/browserify/bin/cmd.js -t sassify2 ./src/extension/chrome/content.js | ./node_modules/uglify-js/bin/uglifyjs > ./dist/chrome/content.compiled.js

# the firefox extension
#mkdir -p ./dist/firefox
