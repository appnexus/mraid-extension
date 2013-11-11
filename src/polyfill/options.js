const url = require('url');
const IPAD_SIZE = { width: 768, height: 1024 };

function _getScreenSize(){
	const PARAM_NAME = 'anx-mraid-screen';
	let queryString = url.parse(window.top.location.toString(), true).query;

	if (!queryString || !queryString[PARAM_NAME]) return IPAD_SIZE;
	
	let strSize = queryString[PARAM_NAME];
	let dimensions = strSize.split(/x/i);

	if (!dimensions || dimensions.length < 2) return IPAD_SIZE;

	return { width: dimensions[0], height: dimensions[1] };
}

exports.getScreenSize = function(){
	try {
		return _getScreenSize();
	} 
	catch(e) {
		console.error('anx-mraid: failed looking for screen size parameter in the url.');
		return IPAD_SIZE;
	}
};
