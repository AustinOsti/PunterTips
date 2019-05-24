'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Setup = mongoose.model('Setup'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, setup;

/**
 * Setup routes tests
 */
describe('Setup CRUD tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		// Create a new user
		user = new User({
			firstName: 'Full',
			lastName: 'Name',
			displayName: 'Full Name',
			email: 'test@test.com',
			username: credentials.username,
			password: credentials.password,
			provider: 'local'
		});

		// Save a user to the test db and create new Setup
		user.save(function() {
			setup = {
				name: 'Setup Name'
			};

			done();
		});
	});

	it('should be able to save Setup instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Setup
				agent.post('/setups')
					.send(setup)
					.expect(200)
					.end(function(setupSaveErr, setupSaveRes) {
						// Handle Setup save error
						if (setupSaveErr) done(setupSaveErr);

						// Get a list of Setups
						agent.get('/setups')
							.end(function(setupsGetErr, setupsGetRes) {
								// Handle Setup save error
								if (setupsGetErr) done(setupsGetErr);

								// Get Setups list
								var setups = setupsGetRes.body;

								// Set assertions
								(setups[0].user._id).should.equal(userId);
								(setups[0].name).should.match('Setup Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Setup instance if not logged in', function(done) {
		agent.post('/setups')
			.send(setup)
			.expect(401)
			.end(function(setupSaveErr, setupSaveRes) {
				// Call the assertion callback
				done(setupSaveErr);
			});
	});

	it('should not be able to save Setup instance if no name is provided', function(done) {
		// Invalidate name field
		setup.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Setup
				agent.post('/setups')
					.send(setup)
					.expect(400)
					.end(function(setupSaveErr, setupSaveRes) {
						// Set message assertion
						(setupSaveRes.body.message).should.match('Please fill Setup name');
						
						// Handle Setup save error
						done(setupSaveErr);
					});
			});
	});

	it('should be able to update Setup instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Setup
				agent.post('/setups')
					.send(setup)
					.expect(200)
					.end(function(setupSaveErr, setupSaveRes) {
						// Handle Setup save error
						if (setupSaveErr) done(setupSaveErr);

						// Update Setup name
						setup.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Setup
						agent.put('/setups/' + setupSaveRes.body._id)
							.send(setup)
							.expect(200)
							.end(function(setupUpdateErr, setupUpdateRes) {
								// Handle Setup update error
								if (setupUpdateErr) done(setupUpdateErr);

								// Set assertions
								(setupUpdateRes.body._id).should.equal(setupSaveRes.body._id);
								(setupUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Setups if not signed in', function(done) {
		// Create new Setup model instance
		var setupObj = new Setup(setup);

		// Save the Setup
		setupObj.save(function() {
			// Request Setups
			request(app).get('/setups')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Setup if not signed in', function(done) {
		// Create new Setup model instance
		var setupObj = new Setup(setup);

		// Save the Setup
		setupObj.save(function() {
			request(app).get('/setups/' + setupObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', setup.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Setup instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Setup
				agent.post('/setups')
					.send(setup)
					.expect(200)
					.end(function(setupSaveErr, setupSaveRes) {
						// Handle Setup save error
						if (setupSaveErr) done(setupSaveErr);

						// Delete existing Setup
						agent.delete('/setups/' + setupSaveRes.body._id)
							.send(setup)
							.expect(200)
							.end(function(setupDeleteErr, setupDeleteRes) {
								// Handle Setup error error
								if (setupDeleteErr) done(setupDeleteErr);

								// Set assertions
								(setupDeleteRes.body._id).should.equal(setupSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Setup instance if not signed in', function(done) {
		// Set Setup user 
		setup.user = user;

		// Create new Setup model instance
		var setupObj = new Setup(setup);

		// Save the Setup
		setupObj.save(function() {
			// Try deleting Setup
			request(app).delete('/setups/' + setupObj._id)
			.expect(401)
			.end(function(setupDeleteErr, setupDeleteRes) {
				// Set message assertion
				(setupDeleteRes.body.message).should.match('User is not logged in');

				// Handle Setup error error
				done(setupDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Setup.remove().exec();
		done();
	});
});