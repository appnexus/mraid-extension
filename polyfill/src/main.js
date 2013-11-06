var Mraid = require('./mraid'),
	$ = require('jquery-browserify');

window.mraid = new Mraid({
	placementType: 'inline',
	screen: {
		width: 768,
		height: 1024
	}
});

if (!window.mocha){
	if (window.document.readyState === 'complete'){
		window.mraid.triggerReady();
	} else {
		$(window).load(function(){
			window.mraid.triggerReady();
		});
	}
}
