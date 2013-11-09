var express = require('express'),
	http = require('http'),
	sys = require('sys'),
	exec = require('child_process').exec,
	path = require('path') ;

exec('./build.sh -d', function(err, stdout){
	sys.puts(stdout);
});

var app = express();
var port = process.env.PORT || 9000;

app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	return next();
});

app.use(function(req, res, next){
	if (!/mraid.js$/.test(req.url)) return next();

	res.sendfile('dist/mraid.js');
});

app.use(express.static(path.join(__dirname, '/public')));

http.createServer(app).listen(port, function(){
    console.log('listening on port ' + port);
});
