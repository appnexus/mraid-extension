mraid-extension
===============
Enable viewing of [MRAID](http://www.iab.net/mraid) creatives in a desktop browser by intercepting requests for mraid.js and serving a polyfill in it's place.

Installation
============
The extension is available for download from the chrome store [here](https://chrome.google.com/webstore/detail/appnexus-mraid-viewer/kljmljefjfkglealiaheaapimodndfno).

Running locally
===============
		npm install
		npm start

Debug versions will be located in the dist/ directory and will be rebuilt when any of the src/ files change.

Building a release version
==========================
		npm install
		./build.sh

Release version will be located in the dist/ directory.  The dist/chrome\_release.zip can be uploaded the chrome store. 
