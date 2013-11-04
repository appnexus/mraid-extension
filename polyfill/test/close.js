var expect = require('./chai-expect');
var util = require('./util');

describe('#close()', function(){
	it('should return expanded ad to regular size', function(){
		mraid.expand();
		mraid.close();

		util.expectAdSize(320, 50);
	});

	it('should hide the close button', function(){
		var $ad = util.get$Ad();

		mraid.expand();
		mraid.close();

		expect($ad.find('.anx-mraid-close')).to.be.not.visible;
	});

	it('should hide the ad', function(){
		var $ad = util.get$Ad();

		mraid.close();

		expect($ad).to.be.not.visible;
	});
});
