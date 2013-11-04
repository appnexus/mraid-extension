var expect = require('./chai-expect');

describe('#getResizeProperties()', function(){
	it('should give you back what you set', function(){
		var o = {width: 600, height: 200};
		mraid.setResizeProperties(o);

		expect(mraid.getResizeProperties()).to.be.equal(o);
		expect(mraid.getExpandProperties()).to.be.not.equal(o);
	});
});
