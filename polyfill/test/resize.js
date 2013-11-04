var sinon = require('sinon');
var expect = require('./chai-expect');
var util = require('./util');

describe('#resize()', function(){
	it('should error if no resize properties', function(){
		var errorCallback = sinon.spy();
		mraid.addListener('error', errorCallback);

		mraid.resize();

		expect(errorCallback).to.have.been.calledOnce;
	});
	it('should not change state if no resize properties', function(){
		var errorCallback = sinon.spy();
		mraid.addListener('error', errorCallback);

		mraid.resize();

		expect(mraid.getState()).to.be.equal('default');
	});
	it('should change the size', function(){
		mraid.setResizeProperties({
			width:150,
			height:200
		});

		mraid.resize();

		util.expectAdSize(150, 200);
	});
});
