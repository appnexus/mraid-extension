var Mraid = require('./mraid'),
	options = require('./options'),
	$ = require('jquery-browserify');

window.mraid = new Mraid({
	placementType: 'inline',
	screen: options.getScreenSize()
});

if (!window.mocha){
	if (window.document.readyState === 'complete'){
		window.mraid.triggerReady();
	} else {
		$(function(){
			window.mraid.triggerReady();
		});
	}
}
