var Resizer = require('../../resizer');
var resizer = new Resizer(),
	origins;

resizer.on('save-origins', function(ev){
	origins = ev.origins || [];

	self.port.emit('save-origins', origins);
});

resizer.on('load-origins', function(ev){
	ev.cb(origins);
});

self.port.on('load-origins', function(data){
	origins = data || [];
});
