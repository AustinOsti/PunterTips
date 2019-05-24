'use strict';

// Setups controller
angular.module('setups').controller('SetupsController', ['$scope', '$stateParams', '$location', 'Authentication', 'Setups',
	function($scope, $stateParams, $location, Authentication, Setups) {
		$scope.authentication = Authentication;

		// Create new Setup
		$scope.create = function() {
			// Create new Setup object
			var setup = new Setups ({
				name: this.name
			});

			// Redirect after save
			setup.$save(function(response) {
				$location.path('setups/' + response._id);

				// Clear form fields
				$scope.name = '';
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Remove existing Setup
		$scope.remove = function(setup) {
			if ( setup ) { 
				setup.$remove();

				for (var i in $scope.setups) {
					if ($scope.setups [i] === setup) {
						$scope.setups.splice(i, 1);
					}
				}
			} else {
				$scope.setup.$remove(function() {
					$location.path('setups');
				});
			}
		};

		// Update existing Setup
		$scope.update = function() {
			var setup = $scope.setup;

			setup.$update(function() {
				$location.path('setups/' + setup._id);
			}, function(errorResponse) {
				$scope.error = errorResponse.data.message;
			});
		};

		// Find a list of Setups
		$scope.find = function() {
			$scope.setups = Setups.query();
		};

		// Find existing Setup
		$scope.findOne = function() {
			$scope.setup = Setups.get({ 
				setupId: $stateParams.setupId
			});
		};
	}
]);