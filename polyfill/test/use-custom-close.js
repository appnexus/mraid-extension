var expect = require('./chai-expect');
var util = require('./util');

describe('#useCustomClose', function(){
	it('should default to false', function(){
		expect(mraid.getExpandProperties().useCustomClose).to.be.false;
	});

	it('should update the expand properties', function(){
		mraid.useCustomClose(true);

		var customClose = mraid.getExpandProperties().useCustomClose;
		expect(customClose).to.be.true;

		mraid.useCustomClose(false);
		
			customClose = mraid.getExpandProperties().useCustomClose;
		expect(customClose).to.be.false;
	});

	it('should NOT show the button when customclose is true', function(){
		mraid.useCustomClose(true);
		
		mraid.expand();

		var $closeBtn = $('.anx-mraid-close');
		expect($closeBtn).to.not.be.visible;
	});
	
	it('should show the button when customclose is false', function(){
		mraid.useCustomClose(false);
		
		mraid.expand();

		var $closeBtn = $('.anx-mraid-close');
		expect($closeBtn.length).to.be.equal(1);
		expect($closeBtn).to.be.visible;
	});

});
