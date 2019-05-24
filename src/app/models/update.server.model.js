'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Update Schema
 */
var UpdateSchema = new Schema({
	country: { 
		type: String
	},
	league: { 
		type: String
	},
	day: { 
		type: Date
	},
	time: { 
		type: String 
	},
	game: { 
		type: String		
	},
	home: { 
		type: String		
	},
	away: { 
		type: String		
	},
	h_goals: { 
		type: Number
	},
	a_goals: { 
		type: Number
	},
	odds_1: { 
		type: Number
	},
	odds_x: { 
		type: Number	
	},
	odds_2: { 
		type: Number
	},
	odds_delta: { 
		type: Number	
	},
	h_status: { 
		type: Boolean	
	},
	d_status: { 
		type: Boolean	
	},
	a_status: { 
		type: Boolean	
	},
	updated: {
		type: Date,
		default: Date.now
	},	
	user: {
		type: Schema.ObjectId,
		ref: 'User'
	}
});

UpdateSchema.pre('save', function(next) {
	this.updated = Date.now;
	next();
});

mongoose.model('Archive', UpdateSchema);