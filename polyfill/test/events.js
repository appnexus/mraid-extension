var util = require('./util'),
	sinon = require('sinon'),
	expect = require('./chai-expect');


describe('events', function(){
	
	describe('when in loading state', function(){

		beforeEach(function(done){
			util.loadAd({
				state: 'loading',
				width: 320,
				height: 50
			}, done);
		});
		it('should not do anything when resize(), expand() or close() are called', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.expand();
			mraid.close();
			mraid.setResizeProperties({});
			mraid.resize();
			mraid.expand();
			mraid.expand();

			expect(errorCallback).to.have.not.been.called;
			expect(errorCallback).to.have.not.been.called;
		});
		it('should fire stateChange before ready', function(){
			var t;
			mraid.addEventListener('ready', function(){t='1';});
			mraid.addEventListener('stateChange', function(){t='2';});
			mraid.triggerReady();

			expect(t).to.be.equal('1');
		});
	});

	describe('when in hidden state', function(){
		beforeEach(function(done){
			util.loadAd({
				state: 'hidden',
				width: 320,
				height: 50
			}, done);

		});
	
		it('should not do anything when resize(), expand() or close() are called', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.expand();
			mraid.close();
			mraid.setResizeProperties({});
			mraid.resize();
			mraid.expand();
			mraid.expand();

			expect(errorCallback).to.have.not.been.called;
			expect(errorCallback).to.have.not.been.called;
		});
	});

	describe('when in default state', function(){
		beforeEach(function(done){
			util.loadAd({
				width: 320,
				height: 50
			}, done);
		});
	
		it('should publish stateChange event when expand() is called', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.expand();

			expect(stateCallback).to.have.been.calledOnce;
			expect(errorCallback).to.have.not.been.called;
		});

		it('should publish stateChange event only once when expand() is called multiple times', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.expand();
			mraid.expand();
			mraid.expand();

			expect(stateCallback).to.have.been.calledOnce;
			expect(errorCallback).to.have.not.been.called;
		});
	});

	describe('when in expanded state', function(){
		
		beforeEach(function(done){
			util.loadAd({
				state: 'expanded',
				width: 320,
				height: 50
			}, done);
		});

		it('should error and nothing else when resize is called', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.resize();

			expect(stateCallback).to.have.not.been.called;
			expect(errorCallback).to.have.been.calledOnce;
		});
		it('should do nothing at all when expand() is called', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.expand();

			expect(stateCallback).to.have.not.been.called;
			expect(errorCallback).to.have.not.been.called;
		});
	});
	describe('when in resized state', function(){

		beforeEach(function(done){
			util.loadAd({
				state: 'resized',
				width: 320,
				height: 50
			}, done);
		});

		it('should fire resize event everytime resize is called', function(){
			var stateCallback = sinon.spy();
			var errorCallback = sinon.spy();

			mraid.addEventListener('error', errorCallback);
			mraid.addEventListener('stateChange', stateCallback);
			mraid.resize();
			mraid.resize();
			mraid.resize();

			expect(stateCallback).to.have.been.calledThrice;
			expect(errorCallback).to.have.not.been.called;
		});
	});
});
