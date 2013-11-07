var expect = require('./chai-expect');
var util = require('./util');

describe('#getCurrentPosition()', function(){
	it('should put the ad in the top left corner', function(){
		var pos = window.mraid.getCurrentPosition();

		expect(pos).to.be.ok;
		expect(pos.x).to.be.equal(0);
		expect(pos.y).to.be.equal(0);
		expect(pos.width).to.be.equal(320);
		expect(pos.height).to.be.equal(50);
	});
	it('should change when expanded', function(){
		window.mraid.expand();
		var pos = window.mraid.getCurrentPosition();

		expect(pos).to.be.ok;
		expect(pos.x).to.be.equal(0);
		expect(pos.y).to.be.equal(0);
		expect(pos.width).to.be.equal(768);
		expect(pos.height).to.be.equal(1024);
	});
	it('should match the ad element dimensions', function(){
		var pos = window.mraid.getCurrentPosition();
		util.expectAdSize(pos.width, pos.height);
	});
});
