'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var setups = require('../../app/controllers/setups.server.controller');

	// Setups Routes
	app.route('/setups')
		.get(setups.list)
		.post(users.requiresLogin, setups.create);

	app.route('/setups/:setupId')
		.get(setups.read)
		.put(users.requiresLogin, setups.hasAuthorization, setups.update)
		.delete(users.requiresLogin, setups.hasAuthorization, setups.delete);

	// Finish by binding the Setup middleware
	app.param('setupId', setups.setupByID);
};
