
var expect = require('./chai-expect');
var util = require('./util');

describe('#storePicture()', function(){
	it('should show the overlay', function(){
		var $ad = util.get$Ad();
		mraid.storePicture('http://popculted.com/wp-content/uploads/2010/06/batman-haters.jpg');

		var $msg = $ad.find('.anx-mraid-msg');
		expect($msg).to.be.visible;
	});
});
