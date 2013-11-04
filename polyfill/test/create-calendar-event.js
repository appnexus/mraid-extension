var expect = require('./chai-expect');
var util = require('./util');

describe('#createCalendarEvent()', function(){
	it('should show the overlay', function(){
		var $ad = util.get$Ad();

		mraid.createCalendarEvent({description:'yah'});

		var $msg = $ad.find('.anx-mraid-msg');
		expect($msg).to.be.visible;
	});
});
