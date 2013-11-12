module.exports = function(iframe, w){
	w = w || iframe.parent;	

	let iframes = w.document.getElementsByTagName('iframe');

	if (!iframes) return;

	for (let x=0; x<iframes.length; x++){
		if (iframes[x].contentWindow !== iframe) continue;

		return iframes[x];
	}

	return null;
};
