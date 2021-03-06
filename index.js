var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var normalizeOptions = require('./opts.js');
var loadtsc = require('./loadtsc.js');

module.exports.compile = function(opts, onError) {

	var compilerPath = opts.compiler && fs.existsSync(opts.compiler) ? opts.compiler : tscPath();
	var ts = loadtsc(compilerPath);
	if (!ts) {
		onError("Unable to sandbox typescript compiler. Try to use supported version <= 1.4.");
		return;
	}

	var tsdir = path.dirname(compilerPath);
	var exitCode = 0;

	var args = normalizeOptions(opts.args);
	args.push('--nolib');
	args = args.concat(opts.files);
	args.push(path.join(tsdir, 'lib.d.ts'));

	function wrap(fn) {
		var original = fn;
		return function (str) {
			if (onError(str) === false) {
				return;
			}
			original(str);
		};
	}

	if (typeof ts.BatchCompiler !== "undefined") { // typescript <= 1.0
		var io = _.extend({}, ts.IO, { arguments: args });

		io.quit = function(code) {
			exitCode = code;
		};

		if (onError) {
			io.stderr.Write = wrap(io.stderr.Write);
			io.stderr.WriteLine = wrap(io.stderr.WriteLine);
		}

		var batch = new ts.BatchCompiler(io);
		batch.batchCompile();
	} else {
		ts.sys.args = args;

		ts.sys.exit = function(code) {
			exitCode = code;
		};

		if (onError) {
			ts.sys.write = wrap(ts.sys.write);
		}

		ts.executeCommandLine(ts.sys.args);
	}

	return exitCode;
};

// default tsc.js path
function tscPath() {
	var ts = require.resolve("typescript");
	// console.log('typescript module path: %s', ts);
	var dir = path.dirname(ts);
	return path.join(dir, 'tsc.js');
}
