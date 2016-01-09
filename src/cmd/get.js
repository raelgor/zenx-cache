/* global dbcs */
/* global zenxUtil */
/* global index */
'use strict';

module.exports = (collection, args, respond) => {
	
	let dbName = args['0'];
	let colName = args['1'];
	let indexName = args['2'];
	let value = args['3'];
	
	// Target index (and create if does not exist)
	let cachedCollection = 
		index[dbName][colName] ||
		(index[dbName][colName] = { $queryIndex: {} });
		
	// Key to look for in index
	let key;
			
	// Form key
	if(typeof indexName == 'object') 
		key = JSON.stringify(indexName);
	else 
		key = value;
		
	// Look for key
	for(let index in cachedCollection)
		if(key in cachedCollection[index])
			return respond(null, cachedCollection[index][key].data);
	
	// Since key was not found, query database
	let queryObject;
	
	if(typeof indexName == 'object') 
		queryObject = indexName;
	else {
		value === undefined && (value = { $exists: 1 });
		queryObject = {
			[indexName]: value
		};
	}
	
	// Query mongodb
	collection.find(queryObject).toArray((err, data) => {
		
		// If no error occured, cache query
		if(!err) {
			
			let indexToBind;
			
			// If a key and value were specified
			// e.g. auth.username and johndoe
			if(args[3] && args[2])
				// Create the auth.username index or
				// set it as our indexToBind
				indexToBind = cachedCollection[args[2]] ||
							  (cachedCollection[args[2]] = {});
			// Otherwise bind to $queryIndex were we store
			// objects returned by complex queries and not
			// queries with a key
			else
				indexToBind = cachedCollection.$queryIndex;
				
			// Create cache object and bind it
			new zenxUtil.CacheItem({ 
				data, 
				attachTo: [
					key, 
					indexToBind  
				]
			});
			
		}
		
		respond(err, data);
		
	});
	
}