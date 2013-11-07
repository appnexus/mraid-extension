#!/usr/bin/env bash

printf 'building'

# the test bundle
node ./node_modules/browserify/bin/cmd.js ./test/main.js > ./public/mocha/tests.js

# the mraid.js polyfill
mkdir -p ./dist
node ./node_modules/browserify/bin/cmd.js -t sassify2 ./src/polyfill/main.js | ./node_modules/uglify-js/bin/uglifyjs > ./dist/mraid.js
printf '.'

# the chrome extension
mkdir -p ./dist/chrome
cp -R ./src/extension/chrome ./dist/
cp ./src/extension/icon128.png ./dist/chrome/
rm ./dist/chrome/content.js
node ./node_modules/browserify/bin/cmd.js -t sassify2 ./src/extension/chrome/content.js | ./node_modules/uglify-js/bin/uglifyjs > ./dist/chrome/content.compiled.js
printf '.'

# the firefox extension
mkdir -p ./dist/firefox
cp -R ./src/extension/firefox ./dist/
cp ./src/extension/icon128.png ./dist/firefox/data
rm ./dist/firefox/data/content.js
node ./node_modules/browserify/bin/cmd.js -t sassify2 ./src/extension/firefox/data/content.js | ./node_modules/uglify-js/bin/uglifyjs > ./dist/firefox/data/content.compiled.js
printf '.'

printf 'done\n'
