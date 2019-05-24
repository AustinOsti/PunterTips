'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	BetList = mongoose.model('BetList'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, betList;

/**
 * Bet list routes tests
 */
describe('Bet list CRUD tests', function() {
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

		// Save a user to the test db and create new Bet list
		user.save(function() {
			betList = {
				name: 'Bet list Name'
			};

			done();
		});
	});

	it('should be able to save Bet list instance if logged in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bet list
				agent.post('/bet-lists')
					.send(betList)
					.expect(200)
					.end(function(betListSaveErr, betListSaveRes) {
						// Handle Bet list save error
						if (betListSaveErr) done(betListSaveErr);

						// Get a list of Bet lists
						agent.get('/bet-lists')
							.end(function(betListsGetErr, betListsGetRes) {
								// Handle Bet list save error
								if (betListsGetErr) done(betListsGetErr);

								// Get Bet lists list
								var betLists = betListsGetRes.body;

								// Set assertions
								(betLists[0].user._id).should.equal(userId);
								(betLists[0].name).should.match('Bet list Name');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to save Bet list instance if not logged in', function(done) {
		agent.post('/bet-lists')
			.send(betList)
			.expect(401)
			.end(function(betListSaveErr, betListSaveRes) {
				// Call the assertion callback
				done(betListSaveErr);
			});
	});

	it('should not be able to save Bet list instance if no name is provided', function(done) {
		// Invalidate name field
		betList.name = '';

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bet list
				agent.post('/bet-lists')
					.send(betList)
					.expect(400)
					.end(function(betListSaveErr, betListSaveRes) {
						// Set message assertion
						(betListSaveRes.body.message).should.match('Please fill Bet list name');
						
						// Handle Bet list save error
						done(betListSaveErr);
					});
			});
	});

	it('should be able to update Bet list instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bet list
				agent.post('/bet-lists')
					.send(betList)
					.expect(200)
					.end(function(betListSaveErr, betListSaveRes) {
						// Handle Bet list save error
						if (betListSaveErr) done(betListSaveErr);

						// Update Bet list name
						betList.name = 'WHY YOU GOTTA BE SO MEAN?';

						// Update existing Bet list
						agent.put('/bet-lists/' + betListSaveRes.body._id)
							.send(betList)
							.expect(200)
							.end(function(betListUpdateErr, betListUpdateRes) {
								// Handle Bet list update error
								if (betListUpdateErr) done(betListUpdateErr);

								// Set assertions
								(betListUpdateRes.body._id).should.equal(betListSaveRes.body._id);
								(betListUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should be able to get a list of Bet lists if not signed in', function(done) {
		// Create new Bet list model instance
		var betListObj = new BetList(betList);

		// Save the Bet list
		betListObj.save(function() {
			// Request Bet lists
			request(app).get('/bet-lists')
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Array.with.lengthOf(1);

					// Call the assertion callback
					done();
				});

		});
	});


	it('should be able to get a single Bet list if not signed in', function(done) {
		// Create new Bet list model instance
		var betListObj = new BetList(betList);

		// Save the Bet list
		betListObj.save(function() {
			request(app).get('/bet-lists/' + betListObj._id)
				.end(function(req, res) {
					// Set assertion
					res.body.should.be.an.Object.with.property('name', betList.name);

					// Call the assertion callback
					done();
				});
		});
	});

	it('should be able to delete Bet list instance if signed in', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Save a new Bet list
				agent.post('/bet-lists')
					.send(betList)
					.expect(200)
					.end(function(betListSaveErr, betListSaveRes) {
						// Handle Bet list save error
						if (betListSaveErr) done(betListSaveErr);

						// Delete existing Bet list
						agent.delete('/bet-lists/' + betListSaveRes.body._id)
							.send(betList)
							.expect(200)
							.end(function(betListDeleteErr, betListDeleteRes) {
								// Handle Bet list error error
								if (betListDeleteErr) done(betListDeleteErr);

								// Set assertions
								(betListDeleteRes.body._id).should.equal(betListSaveRes.body._id);

								// Call the assertion callback
								done();
							});
					});
			});
	});

	it('should not be able to delete Bet list instance if not signed in', function(done) {
		// Set Bet list user 
		betList.user = user;

		// Create new Bet list model instance
		var betListObj = new BetList(betList);

		// Save the Bet list
		betListObj.save(function() {
			// Try deleting Bet list
			request(app).delete('/bet-lists/' + betListObj._id)
			.expect(401)
			.end(function(betListDeleteErr, betListDeleteRes) {
				// Set message assertion
				(betListDeleteRes.body.message).should.match('User is not logged in');

				// Handle Bet list error error
				done(betListDeleteErr);
			});

		});
	});

	afterEach(function(done) {
		User.remove().exec();
		BetList.remove().exec();
		done();
	});
});