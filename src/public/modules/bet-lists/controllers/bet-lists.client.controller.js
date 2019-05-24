'use strict';

// Bet lists controller
angular.module('bet-lists').controller('BetListsController', ['$scope', '$stateParams', '$location', 'Authentication', 'BetLists',
	function($scope, $stateParams, $location, Authentication, BetLists) {
		$scope.authentication = Authentication;

		// Create new Bet list
		$scope.create = function() {
			// Create new Bet list object
			var betList = new BetLists ({
				name: this.name
			});

			// Redirect after save
			betList.$save(function(response) {
				$location.path('bet-lists/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Bet list
		$scope.remove = function(betList) {
			if ( betList ) { 
				betList.$remove();

				for (var i in $scope.betLists) {
					if ($scope.betLists [i] === betList) {
						$scope.betLists.splice(i, 1);
					}
				}
			} else {
				$scope.betList.$remove(function() {
					$location.path('bet-lists');
				});
			}
		};

		// Update existing Bet list
		$scope.update = function() {
			var betList = $scope.betList;

			betList.$update(function() {
				$location.path('bet-lists/' + betList._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Bet lists
		$scope.find = function() {
			$scope.betLists = BetLists.query();
		};

		// Find existing Bet list
		$scope.findOne = function() {
			$scope.betList = BetLists.get({ 
				betListId: $stateParams.betListId
			});
		};
	}
]);