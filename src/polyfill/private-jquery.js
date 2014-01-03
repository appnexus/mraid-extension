var oldDollar = window.$;
var j = require('jquery-browserify');
j.noConflict(true);

if (oldDollar){ window.$ = oldDollar; }

module.exports = j;
