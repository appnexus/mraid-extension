var expect = require('./chai-expect');
var util = require('./util');

describe('#expand()', function(){
	it('should expand to the valid expandProperties', function(){
		mraid.setExpandProperties({
			width:320,
			height:450
		});

		mraid.expand();

		util.expectAdSize(320, 450);
	});
	it('should not expand to larger than the screen', function(){
		mraid.setExpandProperties({
			width:820,
			height:850
		});

		mraid.expand();

		util.expectAdSize(320, 480);
	});
	it('should expand to the full screen if no expand properties are set', function(){
		mraid.expand();
		var pos = mraid.getCurrentPosition();

		util.expectAdSize(320, 480);
	});
});
