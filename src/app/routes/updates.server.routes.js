'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var updates = require('../../app/controllers/updates.server.controller');

	// Updates Routes
	app.route('/listDayResults')
		.get(updates.listDayResults);
		
	app.route('/postDayResults')
		.get(updates.postDayResults);		

	// Finish by binding the Update middleware
	app.param('updateId', updates.updateByID);
};
