#!/usr/bin/env bash

function bundle {
	node ./node_modules/browserify/bin/cmd.js -t sassify2 $1 |
	( [[ "$DEBUG" ]] && cat || ./node_modules/uglify-js/bin/uglifyjs  ) |
	cat > $2
}


DEBUG=
FILE=
OTHERARGS=

while getopts "vhdf:" flag
do
  case "$flag" in
    f) FILE=$OPTARG ;;
    d) DEBUG=true;;
  esac
#  echo "$flag" $OPTIND $OPTARG
done
 
if [ -z $FILE ]; then
  shift $((OPTIND-1))
  OTHERARGS="$@"
fi

printf 'building'

# the test bundle
bundle ./test/main.js ./public/mocha/tests.js
printf '.'

# the mraid.js polyfill
mkdir -p ./dist
bundle ./src/polyfill/main.js ./dist/mraid.js
printf '.'

# the chrome extension
mkdir -p ./dist/chrome
cp -R ./src/extension/chrome ./dist/
cp ./src/extension/icon128.png ./dist/chrome/
rm ./dist/chrome/content.js
bundle ./src/extension/chrome/content.js ./dist/chrome/content.compiled.js
printf '.'

# the firefox extension
mkdir -p ./dist/firefox
cp -R ./src/extension/firefox ./dist/
cp ./src/extension/icon128.png ./dist/firefox/data
rm ./dist/firefox/data/content.js
bundle ./src/extension/firefox/data/content.js ./dist/firefox/data/content.compiled.js
printf '.'

# no console.logs allowed in the release build
if [[ -z "$DEBUG" ]]; then
	sed -E -i '' 's/console\.log\((.*)\);//g' `find ./dist -iname '*.js'`
fi

printf 'done\n'
exit 0
