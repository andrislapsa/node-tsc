var fs = require('fs');
var path = require('path');
var vm = require('vm');
var _ = require('lodash');
var iswin = require('iswin')();

// loads TypeScript compiler
function create_sandbox(compilerPath) {

	// read lines of the tsc.js
	var lines = readlines(compilerPath);

	// comment last lines to avoid autorun:
	// var batch = new TypeScript.BatchCompiler(TypeScript.IO);
	// batch.batchCompile();

	var i = _.findLastIndex(lines, function(l) {
		return (/new\s*(TypeScript\.)?\s*BatchCompiler\((TypeScript\.)?IO\)/).test(l);
	});

	var tsexport;

	if (i >= 0) { // typescript <= 1.0
		lines[i] = '// ' + lines[i];
		// comment possible 'batchCompile' call
		if ((/batchCompile\s*\(\s*\)/).test(lines[i + 1])) {
			lines[i+1] = '// ' + lines[i+1];
		}
		tsexport = ['return TypeScript;'];
	} else { // typescript > 1.0
		var probes = [
			// <= 1.3
			{
				re: /ts\s*\.\s*executeCommandLine\s*\(\s*sys\s*\.\s*args\)\s*;/,
				export: ['ts.sys = sys;', 'return ts;']
			},
			// >= 1.4
			{
				re: /ts\s*\.\s*executeCommandLine\s*\(\s*ts\s*\.\s*sys\s*\.\s*args\)\s*;/,
				export: ['return ts;']
			},
		];
		i = _.reduce(probes, function(i, p) {
			if (i >= 0) return i;
			var re = p.re;
			i = _.findLastIndex(lines, function(l) {
				return re.test(l);
			});
			if (i >= 0) {
				lines[i] = '// ' + lines[i];
				tsexport = p.export;
			}
			return i;
		}, -1);
		if (i < 0) {
			return null;
		}
	}

	// build a wrapping closure
	var script = ['module.exports = (function() {']
		.concat(lines)
		.concat(tsexport)
		.concat(['})();'])
		.join('\n');

	// prepare sandbox to run script
	var filename = compilerPath;

	var sandbox = _.extend({}, global);
	sandbox.require = module.require.bind(module);
	sandbox.exports = module.exports;
	sandbox.__filename = filename;
	sandbox.__dirname = path.dirname(filename);
	sandbox.module = module;
	sandbox.global = sandbox;
	sandbox.root = root;

	// run script to expose typescript compiler API
	return vm.runInNewContext(script, sandbox, { filename: filename });
}

// reads lines of given file
function readlines(path) {
	var text = fs.readFileSync(path, 'utf8');
	return text.split(/\r?\n/);
}

var compilers = {}; // sanbox caches to avoid errors

module.exports = function(compilerPath) {
	if (iswin) {
		compilerPath = compilerPath.toLowerCase();
	}

	var box = compilers[compilerPath];

	if (typeof box == "undefined") {
		box = create_sandbox(compilerPath);
		compilers[compilerPath] = box;
	}

	return box;
};
