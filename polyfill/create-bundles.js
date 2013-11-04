var fs = require('fs');
var browserify = require('browserify');

function dirExists(d){
	try {
		return fs.statSync(d).isDirectory();
	}
	catch (e){
		return false;
	}
}

if (!dirExists('dist')){
	fs.mkdirSync('dist');
}

var mraidBundle = browserify();
mraidBundle.add('./src/main.js');
mraidBundle.transform('sassify2');
mraidBundle.bundle().pipe(fs.createWriteStream('dist/mraid.js'));


var testBundle = browserify();
testBundle.transform('sassify2');
testBundle.add('./test/main.js');
testBundle.bundle().pipe(fs.createWriteStream('public/mocha/tests.js'));
