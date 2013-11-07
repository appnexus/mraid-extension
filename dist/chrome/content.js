/* global chrome:true */
var Resizer = require('../resizer');
var resizer = new Resizer();

resizer.on('save-origins', function(ev){
	chrome.storage.local.set({ 'anx-origins': ev.origins });
});

resizer.on('load-origins', function(ev){
	chrome.storage.local.get('anx-origins', function(data){
		var allowedOrigins = ((data || {})['anx-origins']) || [];
		ev.cb(allowedOrigins);
	});
});
