'use strict';

// Dependencies
var emitter = require('events').EventEmitter;
var cluster = require('cluster');
var zUtil = require('zenx-util');

// Makes a child process that will store cached data
// and start a server
// @todo Make it clustered
module.exports = class ZenXCacheServer {
	
	constructor (options) {
		
		zUtil.console.log('Creating cache process...');
		
		cluster.setupMaster({exec: __dirname + '/cacheProcess.js'});
		
		this.cacheProcess = cluster.fork(__dirname + '/cacheProcess.js');
		
		this.cacheProcess.send(
			JSON.stringify(options)
		);
		
		// Inherit event emitter
		emitter.call(this);
		
		// Event channel
		this.cacheProcess.on('message', (message) => {
			
			message.evt && this.emit(message.evt);
			
		});
		
		this.on('start', () => zUtil.console.log('Cache process online.'));
		
		this.cacheProcess.on('exit', () => zUtil.console.warn('Cache process died.'));
		
	}
	
	// Kill process
	kill() {
		
		zUtil.console.log('Killing cache process...');
		this.cacheProcess.process.kill('SIGTERM');
		
	}	
	
}

module.exports.prototype.__proto__ = emitter.prototype;