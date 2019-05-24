'use strict';

//Setups service used to communicate Setups REST endpoints
angular.module('setups').factory('Setups', ['$resource',
	function($resource) {
		return $resource('setups/:setupId', { setupId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);