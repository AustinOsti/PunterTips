'use strict';

(function() {
	// Bet lists Controller Spec
	describe('Bet lists Controller Tests', function() {
		// Initialize global variables
		var BetListsController,
		scope,
		$httpBackend,
		$stateParams,
		$location;

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
		beforeEach(function() {
			jasmine.addMatchers({
				toEqualData: function(util, customEqualityTesters) {
					return {
						compare: function(actual, expected) {
							return {
								pass: angular.equals(actual, expected)
							};
						}
					};
				}
			});
		});

		// Then we can start by loading the main application module
		beforeEach(module(ApplicationConfiguration.applicationModuleName));

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;

			// Initialize the Bet lists controller.
			BetListsController = $controller('BetListsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Bet list object fetched from XHR', inject(function(BetLists) {
			// Create sample Bet list using the Bet lists service
			var sampleBetList = new BetLists({
				name: 'New Bet list'
			});

			// Create a sample Bet lists array that includes the new Bet list
			var sampleBetLists = [sampleBetList];

			// Set GET response
			$httpBackend.expectGET('bet-lists').respond(sampleBetLists);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.betLists).toEqualData(sampleBetLists);
		}));

		it('$scope.findOne() should create an array with one Bet list object fetched from XHR using a betListId URL parameter', inject(function(BetLists) {
			// Define a sample Bet list object
			var sampleBetList = new BetLists({
				name: 'New Bet list'
			});

			// Set the URL parameter
			$stateParams.betListId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/bet-lists\/([0-9a-fA-F]{24})$/).respond(sampleBetList);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.betList).toEqualData(sampleBetList);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(BetLists) {
			// Create a sample Bet list object
			var sampleBetListPostData = new BetLists({
				name: 'New Bet list'
			});

			// Create a sample Bet list response
			var sampleBetListResponse = new BetLists({
				_id: '525cf20451979dea2c000001',
				name: 'New Bet list'
			});

			// Fixture mock form input values
			scope.name = 'New Bet list';

			// Set POST response
			$httpBackend.expectPOST('bet-lists', sampleBetListPostData).respond(sampleBetListResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Bet list was created
			expect($location.path()).toBe('/bet-lists/' + sampleBetListResponse._id);
		}));

		it('$scope.update() should update a valid Bet list', inject(function(BetLists) {
			// Define a sample Bet list put data
			var sampleBetListPutData = new BetLists({
				_id: '525cf20451979dea2c000001',
				name: 'New Bet list'
			});

			// Mock Bet list in scope
			scope.betList = sampleBetListPutData;

			// Set PUT response
			$httpBackend.expectPUT(/bet-lists\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/bet-lists/' + sampleBetListPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid betListId and remove the Bet list from the scope', inject(function(BetLists) {
			// Create new Bet list object
			var sampleBetList = new BetLists({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Bet lists array and include the Bet list
			scope.betLists = [sampleBetList];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/bet-lists\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleBetList);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.betLists.length).toBe(0);
		}));
	});
}());