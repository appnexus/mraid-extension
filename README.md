#mraid-extension
Enable viewing of [MRAID](http://www.iab.net/mraid) creatives in a desktop browser.

There are two components, a polyfill that creates the window.mraid object and a browser extension that intercepts any request for mraid.js files and redirects the request to the polyfill.

#Installation
The extension is available for download from the chrome store [here](https://chrome.google.com/webstore/detail/appnexus-mraid-viewer/kljmljefjfkglealiaheaapimodndfno).

#Running the extension locally
`````````
npm install
npm start
`````````
After starting the app, you will be serving mraid.js from localhost:9000/mraid.js.  You can also load the local version of the chrome extension by opening chrome://extensions, click the 'Developer Mode' checkbox, click 'Load upacked extension' button and select the dist/chrome folder.  At this point, your browser will redirect all requests for any mraid.js file to localhost:9000/mraid.js.

##Editing the local files
After running npm start, any changes under the src/polyfill/ directory will be picked up automatically, but changes under src/extension/ will require reloading the extension from the chrome://extensions page.

Building a release version
--------------------------
`````````
npm install
./build.sh
`````````
Release version will be located in the dist/ directory.  The dist/chrome\_release.zip can be uploaded the chrome store. 
