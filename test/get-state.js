var util = require('./util'),
	sinon = require('sinon'),
	chai = require('chai');

chai.use(require('sinon-chai'));
chai.use(require('chai-jquery'));

var expect = chai.expect;

describe('#getState', function(){
	
	describe('when in loading state', function(){

		beforeEach(function(done){
			util.loadAd({
				state: 'loading',
				width: 320,
				height: 50
			}, done);
		});
		it('should not change state when expand() is called', function(){
			mraid.expand();
			expect(mraid.getState()).to.be.equal('loading');
		});

		it('should not change state when expand() is called', function(){
			mraid.close();
			expect(mraid.getState()).to.be.equal('loading');
		});

		it('should not change state when resize() is called', function(){
			mraid.resize();
			expect(mraid.getState()).to.be.equal('loading');
		});

		it('should not do anything when resize(), expand() or close() are called', function(){
			mraid.expand();
			mraid.close();
			mraid.resize();
			mraid.expand();
			mraid.expand();

			expect(mraid.getState()).to.be.equal('loading');
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
			mraid.expand();
			mraid.close();
			mraid.resize();
			mraid.expand();
			mraid.expand();

			expect(mraid.getState()).to.be.equal('hidden');
		});

		it('should not be visible', function(){
			expect(util.get$Ad()).to.not.be.visible;
		});

	});

	describe('when in default state', function(){
		beforeEach(function(done){
			util.loadAd({
				width: 320,
				height: 50
			}, done);
		});
	
		it('should change state to expand when expand() is called', function(){
			mraid.expand();
			expect(mraid.getState()).to.be.equal('expanded');
		});

		it('should change state to hidden when close() is called', function(){
			mraid.close();
			expect(mraid.getState()).to.be.equal('hidden');
		});

		it('should change state to "resized" when resize() is called', function(){
			mraid.setResizeProperties({});
			mraid.resize();
			expect(mraid.getState()).to.be.equal('resized');
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

		it('should not change state when resize() is called', function(){
			mraid.resize();
			mraid.setResizeProperties({});
			expect(mraid.getState()).to.be.equal('expanded');
		});
		it('should change state to "default" when close() is called', function(){
			mraid.close();
			expect(mraid.getState()).to.be.equal('default');
		});
		it('should do nothing at all when expand() is called', function(){
			mraid.expand();

			expect(mraid.getState()).to.be.equal('expanded');
		});
	});
	describe('when in resized state', function(){

		beforeEach(function(done){
			util.loadAd({
				state: 'resized',
				width: 320,
				height: 50
			}, function(){
				mraid.setResizeProperties({});
				done();
			});
		});

		it('should change state when expand() is called', function(){
			mraid.expand();
			expect(mraid.getState()).to.be.equal('expanded');
		});
		it('should change state to "default" when close() is called', function(){
			mraid.close();
			expect(mraid.getState()).to.be.equal('default');
		});
	});
});
