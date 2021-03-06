norm = require '../opts'
expect = require 'expect.js'

describe 'options normalizer', ->

	it 'should split string', ->
		expect(norm('--target ES5')).to.eql(['--target', 'ES5'])

	it 'should skip any array', ->
		[[], ['--target', 'ES5']].forEach (args) ->
			expect(norm(args)).to.be(args)

	describe 'with hash input', ->
		it 'should handle flag options', ->
			[
				'noImplicitAny',
				'noResolve',
				'removeComments',
				'sourcemap',
				'sourceMap|sourcemap',
			].forEach (opt) ->
				p = opt.split '|'
				p.push p[0] unless p.length != 1
				args = {}
				args[p[0]] = true
				expect(norm(args)).to.eql(['--' + p[1]])

		it 'should handle string options', ->
			[
				'module=amd',
				'target=ES5',
				'out=test'
			].forEach (opt) ->
				p = opt.split '='
				expect(p.length).to.be(2)
				args = {}
				args[p[0]] = p[1]
				expect(norm(args)).to.eql(['--' + p[0], p[1]])
