/* global chrome:true */
var mraidUrl = 'ANX_MRAID_URL';

chrome.webRequest.onBeforeRequest.addListener(
	_beforeRequest,
	{urls: ['<all_urls>']},
	['blocking']
);

function _beforeRequest(details){
	if (!/mraid\.js($|\?)/i.test(details.url)) return;
	if (details.url === mraidUrl) return;
	
	chrome.tabs.getSelected(null, function(tab){
		chrome.pageAction.show(tab.id);
	});

	return { redirectUrl: mraidUrl };
}
