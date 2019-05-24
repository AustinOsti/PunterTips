'use strict';

module.exports = function(app) {
	var users = require('../../app/controllers/users.server.controller');
	var betLists = require('../../app/controllers/bet-lists.server.controller');

	// Bet lists Routes
	app.route('/bet-lists')
		.get(betLists.list)
		.post(users.requiresLogin, betLists.create);

	app.route('/bet-lists/:betListId')
		.get(betLists.read)
		.put(users.requiresLogin, betLists.hasAuthorization, betLists.update)
		.delete(users.requiresLogin, betLists.hasAuthorization, betLists.delete);

	// Finish by binding the Bet list middleware
	app.param('betListId', betLists.betListByID);
};
