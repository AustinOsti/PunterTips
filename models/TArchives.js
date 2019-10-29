var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TennisArchiveSchema = new Schema({
	day: { 
		type: Date
	},
	time: { 
		type: String 
	},
	game: { 
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
	}
});

module.exports = mongoose.model('TArchives', TennisArchiveSchema);
