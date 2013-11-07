var expect = require('./chai-expect');

describe('#getScreenSize()', function(){
	it('should return 320x480', function(){
		var size = window.mraid.getScreenSize();

		expect(size).to.be.ok;
		expect(size.width).to.be.equal(320);
		expect(size.height).to.be.equal(480);
	});
});

