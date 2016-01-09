'use strict';

var querystring = require('querystring');
var http = require('http');

module.exports = class ZenXCacheClient {
	
	constructor (config) {
		
		this._config = config;
		
	}
	
	get(){
		
		return this._send('get', arguments);
		
	}

	upsert() {
		
		return this._send('upsert', arguments);
		
	}
	
	remove() {
		
		return this._send('remove', arguments);
		
	}

	_send(cmd, args) {
		
		return new Promise((resolve, reject) => {
			
			var cacheRequest = http.request({
				method: 'POST',
				host: this._config.bind,
				port: this._config.port,
				path: '/',
				headers: {
					'content-type': 'application/x-www-form-urlencoded'
				}
			}, (response) => {
				
				let data = '';
				
				response.on('data', (chunk) => data += chunk);
				response.on('error', reject);
				response.on('end', () => resolve(JSON.parse(data)));
				
			});
			
			cacheRequest.on('error', reject);
			
			cacheRequest.write(querystring.stringify({
				cmd: cmd,
				args: JSON.stringify(args)
			}));
			
			cacheRequest.end();
			
		});
		
	}
	
}