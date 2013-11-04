var expect = require('./chai-expect');

describe('#getMaxSize()', function(){
	it('should return the screen size', function(){
		var size = window.mraid.getMaxSize();

		expect(size).to.be.ok;
		expect(size.width).to.be.equal(320);
		expect(size.height).to.be.equal(480);
	});
});


