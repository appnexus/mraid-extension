var expect = require('./chai-expect');

describe('#getExpandProperties()', function(){
	it('should default to screen size', function(){
		var xp = mraid.getExpandProperties();

		expect(xp).to.be.ok;
		expect(xp.width).to.be.equal(320);
		expect(xp.height).to.be.equal(480);
	});

	it('should give you back what you set', function(){
		var o = {width: 600, height: 200};
		mraid.setExpandProperties(o);

		expect(mraid.getExpandProperties()).to.be.equal(o);
		expect(mraid.getResizeProperties()).to.be.not.equal(o);
	});
});
