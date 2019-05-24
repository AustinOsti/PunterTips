'use strict';

//Setting up route
angular.module('setups').config(['$stateProvider',
	function($stateProvider) {
		// Setups state routing
		$stateProvider.
		state('listSetups', {
			url: '/setups',
			templateUrl: 'modules/setups/views/list-setups.client.view.html'
		}).
		state('createSetup', {
			url: '/setups/create',
			templateUrl: 'modules/setups/views/create-setup.client.view.html'
		}).
		state('viewSetup', {
			url: '/setups/:setupId',
			templateUrl: 'modules/setups/views/view-setup.client.view.html'
		}).
		state('editSetup', {
			url: '/setups/:setupId/edit',
			templateUrl: 'modules/setups/views/edit-setup.client.view.html'
		});
	}
]);