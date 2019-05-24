'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	Setup = mongoose.model('Setup'),
	_ = require('lodash');

/**
 * Create a Setup
 */
exports.create = function(req, res) {
	var setup = new Setup(req.body);
	setup.user = req.user;

	setup.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(setup);
		}
	});
};

/**
 * Show the current Setup
 */
exports.read = function(req, res) {
	res.jsonp(req.setup);
};

/**
 * Update a Setup
 */
exports.update = function(req, res) {
	var setup = req.setup ;

	setup = _.extend(setup , req.body);

	setup.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(setup);
		}
	});
};

/**
 * Delete an Setup
 */
exports.delete = function(req, res) {
	var setup = req.setup ;

	setup.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(setup);
		}
	});
};

/**
 * List of Setups
 */
exports.list = function(req, res) { 
	Setup.find().sort('-created').populate('user', 'displayName').exec(function(err, setups) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(setups);
		}
	});
};

/**
 * Setup middleware
 */
exports.setupByID = function(req, res, next, id) { 
	Setup.findById(id).populate('user', 'displayName').exec(function(err, setup) {
		if (err) return next(err);
		if (! setup) return next(new Error('Failed to load Setup ' + id));
		req.setup = setup ;
		next();
	});
};

/**
 * Setup authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.setup.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
