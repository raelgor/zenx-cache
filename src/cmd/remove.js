/* global dbcs */
/* global index */
'use strict';

module.exports = (collection, args, respond) => {
	
	dbcs[args['0']].collection(args['1']).remove(
		{ _id: args['2']._id },
		respond
	);
	
}