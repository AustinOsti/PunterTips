'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

/**
 * Bet list Schema
 */
var BetSchema = new Schema({	
	country: { 
		type: String, 
		required: 'Country name cannot be left blank.' 
	},
	league: { 
		type: String,
		required: 'League cannot be left blank.'
	},
	day: { 
		type: Date, 
		required: 'Date cannot be left blank'
	},
	time: { 
		type: String 
	},
	game: { 
		type: String,
		required: 'game cannot be left blank'		
	},
	home: { 
		type: String,
		required: 'Home team cannot be left blank'		
	},
	away: { 
		type: String,
		required: 'away team cannot be left blank'		
	},
	h_goals: { 
		type: Number		
	},
	a_goals: { 
		type: Number		
	},
	odds_1: { 
		type: Number,
		required: 'Home ODDS cannot be left blank'		
	},
	odds_x: { 
		type: Number,
		required: 'Draw ODDS cannot be left blank'		
	},
	odds_2: { 
		type: Number,
		required: 'Away ODDS cannot be left blank'		
	},
	odds_delta: { 
		type: Number	
	},
	h_status: { 
		type: Boolean,
		default: false
	},
	d_status: { 
		type: Boolean,
		default: false
	},
	a_status: { 
		type: Boolean,
		default: false
	},
	thtgames: { 
		type: Number,
		default: 0
	},
	tatgames: { 
		type: Number,
		default: 0		
	},
	tpgames: { 
		type: Number,
		default: 0		
	},
	pghtwins: { 
		type: Number,
		default: 0		
	},
	pgdraws: { 
		type: Number,
		default: 0		
	},	
	pgatwins: { 
		type: Number,
		default: 0		
	},
	tpghtwins: { 
		type: Number,
		default: 0		
	},
	tpghtdraws: { 
		type: Number,
		default: 0		
	},	
	tpghtloss: { 
		type: Number,
		default: 0		
	},
	tpgatwins: { 
		type: Number,
		default: 0		
	},
	tpgatdraws: { 
		type: Number,
		default: 0		
	},	
	tpgatloss: { 
		type: Number,
		default: 0		
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

mongoose.model('Bet', BetSchema);