'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var updates = require('../../app/controllers/updates.server.controller');

	// Updates Routes
	app.route('/updates')
		.get(updates.list)
		.post(users.requiresLogin, updates.create);

	app.route('/updates/:updateId')
		.get(updates.read)
		.put(users.requiresLogin, updates.hasAuthorization, updates.update)
		.delete(users.requiresLogin, updates.hasAuthorization, updates.delete);

	// Finish by binding the Update middleware
	app.param('updateId', updates.updateByID);
};
