'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	errorHandler = require('./errors.server.controller'),
	BetList = mongoose.model('BetList'),
	_ = require('lodash');

/**
 * Create a Bet list
 */
exports.create = function(req, res) {
	var betList = new BetList(req.body);
	betList.user = req.user;

	betList.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(betList);
		}
	});
};

/**
 * Show the current Bet list
 */
exports.read = function(req, res) {
	res.jsonp(req.betList);
};

/**
 * Update a Bet list
 */
exports.update = function(req, res) {
	var betList = req.betList ;

	betList = _.extend(betList , req.body);

	betList.save(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(betList);
		}
	});
};

/**
 * Delete an Bet list
 */
exports.delete = function(req, res) {
	var betList = req.betList ;

	betList.remove(function(err) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(betList);
		}
	});
};

/**
 * List of Bet lists
 */
exports.list = function(req, res) { 
	BetList.find().sort('-created').populate('user', 'displayName').exec(function(err, betLists) {
		if (err) {
			return res.status(400).send({
				message: errorHandler.getErrorMessage(err)
			});
		} else {
			res.jsonp(betLists);
		}
	});
};

/**
 * Bet list middleware
 */
exports.betListByID = function(req, res, next, id) { 
	BetList.findById(id).populate('user', 'displayName').exec(function(err, betList) {
		if (err) return next(err);
		if (! betList) return next(new Error('Failed to load Bet list ' + id));
		req.betList = betList ;
		next();
	});
};

/**
 * Bet list authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.betList.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
