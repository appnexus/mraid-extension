var expect = require('./chai-expect');

describe('#getScreenSize()', function(){
	it('should return ipad size', function(){
		var size = window.mraid.getScreenSize();

		expect(size).to.be.ok;
		expect(size.width).to.be.equal(768);
		expect(size.height).to.be.equal(1024);
	});
});

