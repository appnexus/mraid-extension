#!/usr/bin/env bash

function bundle {
	node ./node_modules/browserify/bin/cmd.js -t sassify2 -t es6ify $1 |
	( [[ "$DEBUG" ]] && cat || ./node_modules/uglify-js/bin/uglifyjs -m -c ) |
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

printf 'test bundle\n\n';
# the test bundle
bundle ./test/main.js ./public/mocha/tests.js
printf '.'

printf 'mraid bundle\n\n';
# the mraid.js polyfill
mkdir -p ./dist
bundle ./src/polyfill/main.js ./dist/mraid.js
printf '.'

# the chrome extension
mkdir -p ./dist/chrome
cp -R ./src/extension/chrome ./dist/
cp ./src/extension/icon128.png ./dist/chrome/
rm ./dist/chrome/content.js
printf 'chrome bundle\n\n'
bundle ./src/extension/chrome/content.js ./dist/chrome/content.compiled.js
printf '.'

# the firefox extension
mkdir -p ./dist/firefox
cp -R ./src/extension/firefox ./dist/
cp ./src/extension/icon128.png ./dist/firefox/data
rm ./dist/firefox/data/content.js
printf 'ff bundle\n\n'
bundle ./src/extension/firefox/data/content.js ./dist/firefox/data/content.compiled.js
printf '.'

if [[ -z "$DEBUG" ]]; 
then
	# no console.logs allowed in the release build
	./node_modules/remove-console-logs/remove-console-logs `find ./dist/ -iname '*.js'`

	sed -i 's/ANX_MRAID_URL/http:\/\/cdn\.adnxs\.com\/js\/mraid\.js/' `find ./dist/ -iname '*.js'`
	zip -r ./dist/chrome_release.zip ./dist/chrome
else
	sed -i 's/ANX_MRAID_URL/http:\/\/localhost:9000\/mraid\.js/' `find ./dist/ -iname '*.js'`
fi

printf 'done\n'
exit 0
