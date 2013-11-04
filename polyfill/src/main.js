var Mraid = require('./mraid'),
	$ = require('jquery-browserify');

window.mraid = new Mraid({
	placementType: 'inline',
	screen: {
		width: 320,
		height: 480
	}
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
