'use strict';

// Updates controller
angular.module('updates').controller('UpdatesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Updates', 'UpdateData', 
	function($scope, $stateParams, $location, Authentication, Updates, UpdateData) {
		$scope.authentication = Authentication;
		$scope.user = Authentication.user;
		$scope.displayParams = true;
		$scope.displayConfirmList = false;		
		
		var date = new Date();
		date.setDate(date.getDate() - 1);
		
		var day = date.getDate();
		var month = date.getMonth()+1;
		var year = date.getFullYear().toString();

		if (date < 10){
			date = '0' + date.toString();
		};	

		if (month < 10){
			month = '0' + month.toString();
		};
		const urlLink = year+month+day+'/';
		$scope.resultsUrl = 'https://www.oddsportal.com/matches/soccer/'+urlLink;

		$scope.listDayResults = function(pgNo) {
			$scope.displayParams = false;
			$scope.notice = "Processing ... Please wait";
			if (pgNo==0) {
				$scope.pageNo = 0;
			} else {
				$scope.pageNo = $scope.pageNo + pgNo;
			}
			if ($scope.resultsUrl) {			
				UpdateData.getDayResults(	
					'/listDayResults')
				.then(function (response) {
					$scope.notice = "";	
					$scope.displayConfirmList = true;
					$scope.displayScrolls = true;					
					$scope.updateArchiveList = response;
					$scope.fixturesToUpdate = 'No. of fixtures to archive: '+ response.length;
					console.log(response);
				}, function (errorResponse) {
					$scope.displayParams = true;
					$scope.notice = errorResponse.message;
				});				
			}
		};
		
		$scope.postDayResults = function() {
			UpdateData.postDayResults(	
				'/postDayResults')
			.then(function () {
				$scope.notice = "";	
				$scope.displayConfirmList = false;
				$scope.displayScrolls = false;
				$location.path('updates');
			}, function (errorResponse) {
				$scope.displayConfirmList = true;
				$scope.notice = errorResponse.message;
			});				
		};
	}
]);