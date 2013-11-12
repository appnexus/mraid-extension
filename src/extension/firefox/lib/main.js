var observer = require('observer-service'),
	widgets = require('sdk/widget'),
	pageMod = require('sdk/page-mod'),
	ss = require('sdk/simple-storage'),
	thisExtension = require('self'),
	chrome = require('chrome'),
	Cc = chrome.Cc,
	Ci = chrome.Ci;

var mraidUrl = 'http://cdn.adnxs.com/js/mraid.js';

observer.add('http-on-modify-request', function(subject) {
	subject.QueryInterface(Ci.nsIHttpChannel);

	var url = subject.URI.spec;
	if (typeof url !== 'string' || !/mraid\.js($|\?)/.test(url) || url === mraidUrl) return;
	
	var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);  
	var uri = ios.newURI(mraidUrl, null, null); 

	subject.redirectTo(uri);
});

pageMod.PageMod({
	include: '*',
	attachTo: ["top", "frame", "existing"],
	contentScriptWhen: 'start',
	contentScriptFile: thisExtension.data.url('content.compiled.js'),
	onAttach: function(w){
		w.port.on('save-origins', function(origins){
			ss.storage.anxOrigins = origins;
		});

		w.port.emit('load-origins', ss.storage.anxOrigins || []);
	}
});

widgets.Widget({
	id: "adnxs-mraid-link",
	label: "AppNexus MRAID Viewer",
	contentURL: thisExtension.data.url('icon128.png'),
	onClick: function() {}
});

