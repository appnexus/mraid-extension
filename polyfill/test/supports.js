var expect = require('./chai-expect');
var util = require('./util');

describe('#supports()', function(){
	it('should report "support" for everything in spec by default', function(){
		expect(mraid.supports('sms')).to.be.true;
		expect(mraid.supports('SMS')).to.be.true;
		expect(mraid.supports('tel')).to.be.true;
		expect(mraid.supports('calendar')).to.be.true;
		expect(mraid.supports('storePicture')).to.be.true;
		expect(mraid.supports('inlineVideo')).to.be.true;
	});
	it('should not report "support" for anything NOT spec by default', function(){
		expect(mraid.supports('time-travel')).to.be.false;
	});

});
