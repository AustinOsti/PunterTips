'use strict';

//Setting up route
angular.module('bet-lists').config(['$stateProvider',
	function($stateProvider) {
		// Bet lists state routing
		$stateProvider.
		state('listBetLists', {
			url: '/bet-lists',
			templateUrl: 'modules/bet-lists/views/list-bet-lists.client.view.html'
		}).
		state('createBetList', {
			url: '/bet-lists/create',
			templateUrl: 'modules/bet-lists/views/create-bet-list.client.view.html'
		}).
		state('viewBetList', {
			url: '/bet-lists/:betListId',
			templateUrl: 'modules/bet-lists/views/view-bet-list.client.view.html'
		}).
		state('editBetList', {
			url: '/bet-lists/:betListId/edit',
			templateUrl: 'modules/bet-lists/views/edit-bet-list.client.view.html'
		});
	}
]);