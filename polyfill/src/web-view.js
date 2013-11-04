var videoJs = require('videojs'),
	util = require('util'),
	$ = require('jquery-browserify'),
	EventEmitter = require('events').EventEmitter;

var inIframe = window !== window.top;

// todo: handle this like a grownup
try {
	var css = require('./style.scss');
}
catch (e){}

var WebView = function(options){
	EventEmitter.call(this);

	var self = this,
		$mraidTag,
		$webView,
		$close,
		videoCount = 0,
		initialSize,
		screenSize;

	options = options || {};
	screenSize = {
		width: options.width || 300,
		height: options.height || 500
	};

	function buildCloseButton(){
		var $close =  $('<div />')
			.attr('class', 'anx-mraid-close')
			.append('<span>X</span>')
			.hide();

		if (!inIframe){
			$close.addClass('anx-mraid-close-iframe');
		}

		return $close;
	}

	function findWebView(){
		var $el;
		$el = $mraidTag.parent();
		if ($el.length && /head/i.test($el[0].tagName)){
			$el = $('body');
		}

		if (!inIframe && $el.is('body')){
			// now we are getting crazy.
			// if we are the only thing on page then empty the page and re-request the 
			// creative from within an iframe so that we have a container that we can size.

			$el.css('padding', '0px');
			$el.empty();

			var $iframe = $('<iframe />')
				.css('border', 'none')
				.attr('src', window.location.toString());
	
			$el.append($iframe);
			return null;
		}

		return $el;
	}

	this.hide = function() { $webView.hide(); };
	this.show = function() { $webView.show(); };
	this.showClose = function(){ $close.show(); };
	this.hideClose = function(){ $close.hide(); };

	this.resetSize = function(){
		this.setSize(initialSize.width, initialSize.height);
	};

	this.getInitialSize = function(){ return initialSize; };
	this.getScreenSize = function() { return screenSize; };
	this.getCurrentPosition = function() {
		if (!$webView) return {x: 0, y: 0};

		return {
			x: 0,
			y: 0,
			width: $webView.width(),
			height: $webView.height()
		};
	};

	this.getDefaultPosition = function(){
		var pos = Object.create(this.getInitialSize());
		pos.x = 0;
		pos.y = 0;

		return pos;
	};

	this.showMessage = function(txt){
		var $msg = $('<div class="anx-mraid-msg"></div>');

		$msg.append($('<p></p>')
			.text(txt));

		var $closeBtn = buildCloseButton();

		$closeBtn.click(function(){
			$msg.remove();
			$(this).remove();
		});

		$webView.append($closeBtn);
		$webView.append($msg);
		$msg.slideDown('fast', function (){ $closeBtn.fadeIn('fast'); });
	};

	this.showUrl = function(url){
		var $iframe = $('<iframe class="anx-mraid-url"></iframe>')
			.attr('src', url);
	
		$webView.append($iframe);
	};

	this.showVideo = function(url){
		videoCount += 1;
		url = url || '';

		var beforeVideoSize = this.getCurrentPosition();
		var maxSize = this.getScreenSize();
		var $children = $webView.children();
		$children.hide();

		var videoOptions = {
			autoplay: true,
			controls: false
		};

		var videoId = 'anx-mraid-video-' + videoCount;
		var $video = $('<video class="video-js"></video>')
			.css('max-width', maxSize.width + 'px')
			.css('max-height', maxSize.height + 'px')
			.attr('id', videoId);

		var $source = $('<source></source>')
			.attr('type', 'video/'+ url.match(/\.(\w*)($|\?)/)[1])
			.attr('src', url);

		$video.append($source);
		$webView.append($video);

		var $closeBtn = buildCloseButton();
		$closeBtn.addClass('anx-mraid-video-close');
		$closeBtn.show();

		$closeBtn.click(function(){
			$('#'+videoId).remove();
			$closeBtn.remove();
			$children.show();

			self.setSize(beforeVideoSize.width, beforeVideoSize.height);
		});

		videoJs(videoId, videoOptions, function(){
			this.on('loadedmetadata', function(){
				self.setSize(this.tech.width(), this.tech.height());

				$(this.tag)
					.parent()
					.append($closeBtn);
			});
		});
	};
	
	this.setSize = function(width, height){
		width = width.toString().match(/^(\d+)/)[1] * 1;
		height = height.toString().match(/^(\d+)/)[1] * 1;

		width = Math.min(width, screenSize.width);
		height = Math.min(height, screenSize.height);
	
		if (inIframe){
			// the browser extensions will be listening for this message
			window.parent.postMessage({
				name:'mraid-resize',
				src: window.location.toString(),
				width: width, 
				height: height
			}, '*');
		} else {
			$webView
				.css('width', width + 'px')
				.css('height', height + 'px');
		}
	};

	this.triggerReady = function(){
		$(window.document.head).prepend($('<style></style>').html(css));

		$mraidTag = $('script[src*="mraid.js"]');
		if (!$mraidTag || !$mraidTag.length){
			// no mraid tag, bail!
			return;
		}

		$webView = findWebView();
		if (!$webView) return;

		$webView.addClass('anx-mraid-webview');
		
		$close = buildCloseButton();

		$close.click(function(){
			$webView.find('.anx-mraid-url').remove();
			self.emit('close-click');
			self.hideClose();
		});

		$webView.append($close);

		initialSize = {
			width: $webView.width(),
			height: $webView.height()
		};

		if (inIframe){
			this.setSize(initialSize.width, initialSize.height);
		}

		self.emit('ready'); 
	};
};

util.inherits(WebView, EventEmitter);

module.exports = WebView;
