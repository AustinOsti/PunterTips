'use strict';

//Setting up route
angular.module('updates').config(['$stateProvider',
	function($stateProvider) {
		// Updates state routing
		$stateProvider.
		state('listUpdates', {
			url: '/updates',
			templateUrl: 'modules/updates/views/list-updates.client.view.html'
		}).
		state('createUpdate', {
			url: '/updates/create',
			templateUrl: 'modules/updates/views/create-update.client.view.html'
		}).
		state('viewUpdate', {
			url: '/updates/:updateId',
			templateUrl: 'modules/updates/views/view-update.client.view.html'
		}).
		state('editUpdate', {
			url: '/updates/:updateId/edit',
			templateUrl: 'modules/updates/views/edit-update.client.view.html'
		});
	}
]);