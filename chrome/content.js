/* global chrome:true, confirm:true */

var allowedOrigins;

function _getOrigins(cb){
	if (allowedOrigins) return setTimeout(cb.bind(null, allowedOrigins), 0);

	chrome.storage.local.get('anx-origins', function(data){
		data = data || {};
		allowedOrigins = data['anx-origins'] || [];
		
		cb(allowedOrigins);
	});
}

function _allowOrigin(origin){
	_getOrigins(function(origins){
		origins.push(origin);

		chrome.storage.local.set({ 'anx-origins': origins });
	});
}

function _checkOrigin(message, cb){
	if (/(adnxs.net|adnxs.com|appnexus.com|appnexus.net|devnxs.net|)$/i.test(message.origin)) return setTimeout(cb.bind(null, true), 0);
	
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

window.addEventListener('message', function(message){
	if (!message || !message.data || message.data.name !== 'mraid-resize') return;

	_checkOrigin(message, function(isAuthorized){
		if (isAuthorized){
			_doResize(message);
		}
	});
});

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

