var expect = require('./chai-expect');
var util = require('./util');

describe('#open()', function(){
	it('should show the overlay for tel:', function(){
		var $ad = util.get$Ad();
		mraid.open('tel:555-555-5555');

		var $msg = $ad.find('.anx-mraid-msg');
		expect($msg).to.be.visible;
	});
	it('should show the overlay for sms:', function(){
		var $ad = util.get$Ad();
		mraid.open('sms:555-555-5555');

		var $msg = $ad.find('.anx-mraid-msg');
		expect($msg).to.be.visible;
	});
});
