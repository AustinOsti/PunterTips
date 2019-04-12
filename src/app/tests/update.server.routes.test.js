'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	Update = mongoose.model('Update'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, update;

/**
 * Update routes tests
 */
describe('Update CRUD tests', function() {
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

		// Save a user to the test db and create new Update
		user.save(function() {
			update = {
				name: 'Update Name'
			};

			done();
		});
	});

	it('should be able to save Update instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Update
				agent.post('/updates')
					.send(update)
					.expect(200)
					.end(function(updateSaveErr, updateSaveRes) {
						// Handle Update save error
						if (updateSaveErr) done(updateSaveErr);

						// Get a list of Updates
						agent.get('/updates')
							.end(function(updatesGetErr, updatesGetRes) {
								// Handle Update save error
								if (updatesGetErr) done(updatesGetErr);

								// Get Updates list
								var updates = updatesGetRes.body;

								// Set assertions
								(updates[0].user._id).should.equal(userId);
								(updates[0].name).should.match('Update Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Update instance if not logged in', function(done) {
		agent.post('/updates')
			.send(update)
			.expect(401)
			.end(function(updateSaveErr, updateSaveRes) {
				// Call the assertion callback
				done(updateSaveErr);
			});
	});

	it('should not be able to save Update instance if no name is provided', function(done) {
		// Invalidate name field
		update.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Update
				agent.post('/updates')
					.send(update)
					.expect(400)
					.end(function(updateSaveErr, updateSaveRes) {
						// Set message assertion
						(updateSaveRes.body.message).should.match('Please fill Update name');
						
						// Handle Update save error
						done(updateSaveErr);
					});
			});
	});

	it('should be able to update Update instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Update
				agent.post('/updates')
					.send(update)
					.expect(200)
					.end(function(updateSaveErr, updateSaveRes) {
						// Handle Update save error
						if (updateSaveErr) done(updateSaveErr);

						// Update Update name
						update.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Update
						agent.put('/updates/' + updateSaveRes.body._id)
							.send(update)
							.expect(200)
							.end(function(updateUpdateErr, updateUpdateRes) {
								// Handle Update update error
								if (updateUpdateErr) done(updateUpdateErr);

								// Set assertions
								(updateUpdateRes.body._id).should.equal(updateSaveRes.body._id);
								(updateUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Updates if not signed in', function(done) {
		// Create new Update model instance
		var updateObj = new Update(update);

		// Save the Update
		updateObj.save(function() {
			// Request Updates
			request(app).get('/updates')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Update if not signed in', function(done) {
		// Create new Update model instance
		var updateObj = new Update(update);

		// Save the Update
		updateObj.save(function() {
			request(app).get('/updates/' + updateObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', update.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Update instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Update
				agent.post('/updates')
					.send(update)
					.expect(200)
					.end(function(updateSaveErr, updateSaveRes) {
						// Handle Update save error
						if (updateSaveErr) done(updateSaveErr);

						// Delete existing Update
						agent.delete('/updates/' + updateSaveRes.body._id)
							.send(update)
							.expect(200)
							.end(function(updateDeleteErr, updateDeleteRes) {
								// Handle Update error error
								if (updateDeleteErr) done(updateDeleteErr);

								// Set assertions
								(updateDeleteRes.body._id).should.equal(updateSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Update instance if not signed in', function(done) {
		// Set Update user 
		update.user = user;

		// Create new Update model instance
		var updateObj = new Update(update);

		// Save the Update
		updateObj.save(function() {
			// Try deleting Update
			request(app).delete('/updates/' + updateObj._id)
			.expect(401)
			.end(function(updateDeleteErr, updateDeleteRes) {
				// Set message assertion
				(updateDeleteRes.body.message).should.match('User is not logged in');

				// Handle Update error error
				done(updateDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		Update.remove().exec();
		done();
	});
});