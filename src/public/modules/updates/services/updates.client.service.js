'use strict';

//Updates service used to communicate Updates REST endpoints
angular
.module('updates')
.factory('Updates', ['$resource',
	function($resource) {
		return $resource('updates/:updateId', { updateId: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});
	}
])
.factory('UpdateData', function($http, $q){
	return {
		getDayResults: function (eventListUrl) {
			var deferred  = $q.defer();			
			$http.get(eventListUrl, 
			{params: {}})
			.success(function (data) {
				deferred.resolve(data);
			})
			.error(function (errorResponse){
				deferred.reject(errorResponse);
			});					;
			return deferred.promise;
		},
		postDayResults: function (eventListUrl) {
			var deferred  = $q.defer();			
			$http.get(eventListUrl, 
			{params: {}})
			.success(function (data) {
				deferred.resolve(data);
			})
			.error(function (errorResponse){
				deferred.reject(errorResponse);
			});					;
			return deferred.promise;
		}			
	}	
});