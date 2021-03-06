// tsc options normalizer
module.exports = (function(){

	var _ = require('lodash');

	// tsc options schema:
	//   f - means flag option
	//   s - means string option
	var schemaObj = {
		out: 's', // Specify path to output file
		module: 's', // Specify module code generation: 'commonjs' or 'amd'
		target: 's', // Specify ECMAScript target version: 'ES3' (default), or 'ES5'
		noImplicitAny: 'f', // Warn on expressions and declarations with an implied 'any' type.
		noResolve: 'f', // Skip resolution and preprocessing.
		removeComments: 'f', // Do not emit comments to output.
		sourcemap: ['f', 'sourceMap'],
		sourceRoot: 's', // Specify the location where debugger should locate TypeScript files instead of source locations.
		mapRoot: 's', // Specify the location where debugger should locate map files instead of generated locations.
		outDir: 's', // Redirect output structure to the directory.
		jsx: 's' // Specify JSX code generation: 'preserve' or 'react'
	};

	var schema = _.flatten(Object.keys(schemaObj).map(function(key){
		var val = schemaObj[key];
		if (_.isArray(val)){
			var type = val[0];
			var opts = [{key: key, opt: key, type: type}];
			var aliases = val.slice(1).map(function(k){
				return {key: k, opt: key, type: type};
			});
			return opts.concat(aliases);
		}
		return {key: key, opt: key, type: val};
	}));

	return function(args){
		if (_.isArray(args)){
			return args;
		}
		if (typeof args == 'string') {
			return args.split(' ');
		}
		return _.flatten(schema.filter(function(p){
			if (!args.hasOwnProperty(p.key)){
				return false;
			}
			if (p.type == 'f'){
				return !!args[p.key];
			}
			return true;
		}).map(function(p){
			if (p.type == 'f') {
				return '--' + p.opt;
			}
			return ['--' + p.opt, args[p.key]];
		}));
	};
})();
