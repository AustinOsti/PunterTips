'use strict';

//Setting up route
angular.module('updates').config(['$stateProvider',
	function($stateProvider) {
		// Updates state routing
		$stateProvider.
		state('updateArchive', {
			url: '/updates/archives',
			templateUrl: 'modules/updates/views/update-archive.client.view.html'
		});
	}
]);