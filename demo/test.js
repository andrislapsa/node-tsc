var tsc = require('../index.js');

tsc.compile([__dirname + '/hello.ts'],
	[
		'--sourcemap',
		'--target',
		'ES5'
	], function(msg) {
		console.error(msg);
		return false;
	});