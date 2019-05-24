'use strict';

//Bet lists service used to communicate Bet lists REST endpoints
angular.module('bet-lists').factory('BetLists', ['$resource',
	function($resource) {
		return $resource('bet-lists/:betListId', { betListId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
]);