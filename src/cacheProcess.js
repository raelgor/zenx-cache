/* global zenxUtil */
/* global ZenXServer */
/* global config */
/* global dbcs */
/* global cmd */
'use strict';

// Load dependencies
global.ZenXServer = require('zenx-server');
global.zenxUtil = require('zenx-util');

// Commands
global.cmd = {
	get: require('./cmd/get.js'),
	upsert: require('./cmd/upsert.js'),
	remove: require('./cmd/remove.js')
}

// Index storage
global.index = {};

// Name the process
process.title = 'zenx-cache';

// Handle init message
process.on('message', function(jsonMessage){
	
	var mongodb = zenxUtil.mongodb;
	var dbConnectionsPromises = [];
	
	// Parse json message
	var options = JSON.parse(jsonMessage);
	global.config = options;
	
	// Set logging
	global._zenx_logging = options._zenx_logging;
	
	// Create cache server
	var cacheServer;
	dbConnectionsPromises.push(new Promise((resolve) => (cacheServer = new ZenXServer({
		bind: options.bind,
		port: options.port
	})).once('start', resolve)));
	
	// Database connections storage
	global.dbcs = {};
	
	// Connect to mongodb databases
	// and save connections
	for(let db in config.databases)
		dbConnectionsPromises.push(new Promise((resolve)=>{
			mongodb.connect(
				config.databases[db], 
				(err, dbc) => {
					
					// Store connection
					global.dbcs[db] = dbc;
					
					// Initialize storage
					global.index[db] = {
						
						// Index that uses stringified
						// query objects as keys
						$queryIndex: {}
						
					};
					
					resolve();
				
				}
			);
		}));
	
	// Send started message
	Promise.all(dbConnectionsPromises)
		   .then(() => process.send({ evt: 'start' }));
		   
	// Handle requests
	cacheServer.router.post('/', (req, res, next) => {
		
		// Parse request
		let args = JSON.parse(req.body.args);
		
		let collection = dbcs[args['0']].collection(args['1']);
		
		// @todo Add security; possibly with http-bouncer
		cmd[req.body.cmd](
			collection,
			args, 
			(err, data) => res.end(JSON.stringify([err, data])));
		
	});
	
});