var observer = require('observer-service'),
	widgets = require('sdk/widget'),
	pageMod = require('sdk/page-mod'),
	ss = require('sdk/simple-storage'),
	tabs = require('sdk/tabs'),
	thisExtension = require('self'),
	chrome = require('chrome'),
	Cc = chrome.Cc,
	Ci = chrome.Ci;

var mraidUrl = 'ANX_MRAID_URL',
	tabIconLookup = {};


observer.add('http-on-modify-request', function(subject) {
	subject.QueryInterface(Ci.nsIHttpChannel);

	var url = subject.URI.spec;
	if (typeof url !== 'string' || !/mraid\.js($|\?)/.test(url) || url === mraidUrl) return;
	
	console.log('redirecting to "' + mraidUrl + '".');

	tabIconLookup[tabs.activeTab.id] = true;
	showOrHideIcon();

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


var myWidget =  widgets.Widget({
	id: "anx-mraid-extension-icon",
	label: "AppNexus MRAID Viewer",
	content: '&nbsp;'
});

// this doesn't "mod the page", instead we just need 
// to know when a page load is starting in order to hide/show the
// appnexus icon
pageMod.PageMod({
	include: '*',
	attachTo: ['top'],
	contentScript: ';0;',
	contentScriptWhen: 'start',
	onAttach: function(){
		tabIconLookup[tabs.activeTab.id] = false;
		showOrHideIcon();
	}
});

tabs.on('open', showOrHideIcon);
tabs.on('activate', showOrHideIcon);
tabs.on('deactivate', showOrHideIcon);
tabs.on('close', function(tab){ delete tabIconLookup[tab.id]; });

function showOrHideIcon(tab){
	tab = tab || tabs.activeTab;

	var show = tabIconLookup[tab.id];
	var view = myWidget.getView(tabs.activeTab.window);

	if (show){
		view.content = '<img src="' + thisExtension.data.url('icon128.png') + '" />';
	} else {
		view.content = '&nbsp;';
	}
}
