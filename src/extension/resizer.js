/* global confirm:true */
var util = require('util'),
	EventEmitter = require('events').EventEmitter;

var anxOrigins = [
		'adnxs.net',
		'adnxs.com',
		'appnexus.com',
		'appnexus.net',
		'devnxs.net'
	],
	anOriginRegex = new RegExp(anxOrigins.join('|').replace(/\./, '\\.') + '$', 'i');

function Resizer(){
	EventEmitter.call(this);

	var allowedOrigins,
		self = this;


	function _getOrigins(cb){
		if (allowedOrigins) return setTimeout(cb.bind(null, allowedOrigins), 0);

		self.emit('load-origins', { 
			cb: function(origins){ 
				allowedOrigins = origins || [];
				
				cb(allowedOrigins || []);
			}
		});
	}

	function _allowOrigin(origin){
		_getOrigins(function(origins){
			origins.push(origin);
			allowedOrigins = origins;

			self.emit('save-origins', { origins: origins || [] });
		});
	}

	function _checkOrigin(message, cb){
		if (anOriginRegex.test(message.origin)) return setTimeout(cb.bind(null, true), 0);
		
		_getOrigins(function(origins){
			for (var x=0; x<origins.length; x++){
				if (origins[x] === message.origin){
					return cb(true);
				}
			}

			if (confirm('"' + message.origin + '" wants the AppNexus MRAID extension to resize an iframe.  Do you want to authorize this domain to resize iframes?')){
				_allowOrigin(message.origin);
				return cb(true);
			}
			
			return cb(false);
		});
	}

	function _doResize(message){
		var iframes = window.document.getElementsByTagName('iframe');
		var iframe;

		if (!iframes) return;

		for (var x=0; x<iframes.length; x++){
			if (iframes[x].contentWindow !== message.source) continue;

			iframe = iframes[x];
			break;
		}

		if (iframe && iframe.style){
			iframe.style.width = message.data.width + 'px';
			iframe.style.height = message.data.height + 'px';
		}
	}

	function _init(){
		window.addEventListener('message', function(message){
			if (!message || !message.data || message.data.name !== 'mraid-resize') return;

			_checkOrigin(message, function(isAuthorized){
				if (isAuthorized){
					_doResize(message);
				}
			});
		});
	}

	_init();
}

util.inherits(Resizer, EventEmitter);
module.exports = Resizer;
