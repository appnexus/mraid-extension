var {$} = require('zepto-browserify');
var expect = require('chai').expect;

function _loadAd(options, done){
	options.state = options.state || 'default';
	var w = options.width;
	var h = options.height;

	var $ad = $('<div />')
		.css('width', w + 'px')
		.css('height', h + 'px');

	function _setImgSrc(w, h){
		$img.attr('src', 'http://placekitten.com/' + w + '/' + h);
	}

	var $img = $('<img />')
		.attr('onclick', 'mraid.expand();');

	_setImgSrc(w, h);
	$ad.append($img);

	var script = document.createElement( 'script' );
	script.src = 'mraid.js';
	script.onload = function(){
		mraid.addListener('stateChange', function(s){
			var size = mraid.getCurrentPosition();
			_setImgSrc(size.width, size.height);
		});
		
		if (options.state !== 'loading'){
			mraid.triggerReady();
		} 
		
		if (options.state === 'hidden'){
			mraid.close();
		}
		if (options.state === 'expanded'){
			mraid.expand();
		}
		if (options.state === 'resized'){
			mraid.setResizeProperties({});
			mraid.resize();
		}

		expect(mraid.getState()).to.be.equal(options.state);

		done();
	};

	$('#ad-cntr').html($ad);
	$ad[0].appendChild( script );
}


exports.loadAd = _loadAd;
exports.get$Ad = function(){
	return $('#ad-cntr').first();
};
exports.unloadAd = function(){
	$('#ad-cntr').empty();
}

exports.expectAdSize = function(w, h){
	var $ad = this.get$Ad();

	expect($ad).to.be.ok;
	expect($ad.width()).to.be.equal(w);
	expect($ad.height()).to.be.equal(h);
}
