var util = require('./util'),
	expect = require('./chai-expect');

describe('mraid for browsers', function(){
	beforeEach(function(done){
		util.loadAd({
			width: 320,
			height: 50
		}, done);
	});

	it('should implement every method in the spec', function(){
				
		var methodNames = [
			'addEventListener',
			'createCalendarEvent',
			'close',
			'expand',
			'getCurrentPosition',
			'getDefaultPosition',
			'getExpandProperties',
			'getMaxSize',
			'getPlacementType',
			'getResizeProperties',
			'getScreenSize',
			'getState',
			'getVersion',
			'isViewable',
			'open',
			'playVideo',
			'removeEventListener',
			'resize',
			'setExpandProperties',
			'setOrientationProperties',
			'setResizeProperties',
			'storePicture',
			'supports',
			'useCustomClose'
		];

		methodNames.forEach(function(methodName){
			expect(mraid[methodName], methodName).to.be.a('function');
		});
	});
		
	// whatever whatever.  deal with it.
	require('./get-state');
	require('./close');
	require('./events');
	require('./expand');
	require('./resize');
	require('./supports');
	require('./create-calendar-event');
	require('./play-video');
	require('./use-custom-close');
	require('./store-picture');
	require('./open');
	require('./get-expand-properties');
	require('./get-resize-properties');
	require('./get-default-position');
	require('./get-current-position');
	require('./get-max-size');
	require('./get-screen-size');
});
