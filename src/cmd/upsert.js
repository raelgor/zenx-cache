/* global zenxUtil */
/* global dbcs */
/* global index */
'use strict';

module.exports = (collection, args, respond) => {
	
	let document = args['2'];
	
	document._id = zenxUtil.mongodb.ObjectID(document._id)
	
	collection.update(
		{ _id: document._id },
		document,
		{ upsert: true },
		respond
	);
	
}