'use strict';

(function() {
	// Setups Controller Spec
	describe('Setups Controller Tests', function() {
		// Initialize global variables
		var SetupsController,
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

			// Initialize the Setups controller.
			SetupsController = $controller('SetupsController', {
				$scope: scope
			});
		}));

		it('$scope.find() should create an array with at least one Setup object fetched from XHR', inject(function(Setups) {
			// Create sample Setup using the Setups service
			var sampleSetup = new Setups({
				name: 'New Setup'
			});

			// Create a sample Setups array that includes the new Setup
			var sampleSetups = [sampleSetup];

			// Set GET response
			$httpBackend.expectGET('setups').respond(sampleSetups);

			// Run controller functionality
			scope.find();
			$httpBackend.flush();

			// Test scope value
			expect(scope.setups).toEqualData(sampleSetups);
		}));

		it('$scope.findOne() should create an array with one Setup object fetched from XHR using a setupId URL parameter', inject(function(Setups) {
			// Define a sample Setup object
			var sampleSetup = new Setups({
				name: 'New Setup'
			});

			// Set the URL parameter
			$stateParams.setupId = '525a8422f6d0f87f0e407a33';

			// Set GET response
			$httpBackend.expectGET(/setups\/([0-9a-fA-F]{24})$/).respond(sampleSetup);

			// Run controller functionality
			scope.findOne();
			$httpBackend.flush();

			// Test scope value
			expect(scope.setup).toEqualData(sampleSetup);
		}));

		it('$scope.create() with valid form data should send a POST request with the form input values and then locate to new object URL', inject(function(Setups) {
			// Create a sample Setup object
			var sampleSetupPostData = new Setups({
				name: 'New Setup'
			});

			// Create a sample Setup response
			var sampleSetupResponse = new Setups({
				_id: '525cf20451979dea2c000001',
				name: 'New Setup'
			});

			// Fixture mock form input values
			scope.name = 'New Setup';

			// Set POST response
			$httpBackend.expectPOST('setups', sampleSetupPostData).respond(sampleSetupResponse);

			// Run controller functionality
			scope.create();
			$httpBackend.flush();

			// Test form inputs are reset
			expect(scope.name).toEqual('');

			// Test URL redirection after the Setup was created
			expect($location.path()).toBe('/setups/' + sampleSetupResponse._id);
		}));

		it('$scope.update() should update a valid Setup', inject(function(Setups) {
			// Define a sample Setup put data
			var sampleSetupPutData = new Setups({
				_id: '525cf20451979dea2c000001',
				name: 'New Setup'
			});

			// Mock Setup in scope
			scope.setup = sampleSetupPutData;

			// Set PUT response
			$httpBackend.expectPUT(/setups\/([0-9a-fA-F]{24})$/).respond();

			// Run controller functionality
			scope.update();
			$httpBackend.flush();

			// Test URL location to new object
			expect($location.path()).toBe('/setups/' + sampleSetupPutData._id);
		}));

		it('$scope.remove() should send a DELETE request with a valid setupId and remove the Setup from the scope', inject(function(Setups) {
			// Create new Setup object
			var sampleSetup = new Setups({
				_id: '525a8422f6d0f87f0e407a33'
			});

			// Create new Setups array and include the Setup
			scope.setups = [sampleSetup];

			// Set expected DELETE response
			$httpBackend.expectDELETE(/setups\/([0-9a-fA-F]{24})$/).respond(204);

			// Run controller functionality
			scope.remove(sampleSetup);
			$httpBackend.flush();

			// Test array after successful delete
			expect(scope.setups.length).toBe(0);
		}));
	});
}());