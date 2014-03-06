var sinon = require('sinon');
var expect = require('./chai-expect');
var util = require('./util');
var videojs = require('video.js');

describe('#playVideo', function(){
	afterEach(function(){
		// getting weird audio from videojs without this
		videojs('anx-mraid-video-1').ready(function(){
			this.volume(0);
			util.unloadAd(); 
		});
	});

	it('should show the video when not expanded', function(){
		var $ad = util.get$Ad();

		mraid.playVideo('http://video-js.zencoder.com/oceans-clip.mp4');

		var $video = $ad.find('video');
		expect($video).to.be.visible;
	});

	it('should show the video even when expanded', function(){
		var $ad = util.get$Ad();

		mraid.expand();
		mraid.playVideo('http://video-js.zencoder.com/oceans-clip.mp4');

		var $video = $ad.find('video');
		expect($video).to.be.visible;
	});
});
