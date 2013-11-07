var expect = require('./chai-expect');

describe('#getDefaultPosition()', function(){
	it('should be the top left corner', function(){
		var pos = window.mraid.getDefaultPosition();

		expect(pos).to.be.ok;
		expect(pos.x).to.be.equal(0);
		expect(pos.y).to.be.equal(0);
		expect(pos.width).to.be.equal(320);
		expect(pos.height).to.be.equal(50);
	});

	it('should not change when expanded', function(){
		window.mraid.expand();
		var pos = window.mraid.getDefaultPosition();

		expect(pos).to.be.ok;
		expect(pos.x).to.be.equal(0);
		expect(pos.y).to.be.equal(0);
		expect(pos.width).to.be.equal(320);
		expect(pos.height).to.be.equal(50);
	});
});
