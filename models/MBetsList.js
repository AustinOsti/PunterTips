var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var betListSchema = new Schema({	
	_id: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		auto: true
	},	
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
	tpghtah: { 
		type: Number,
		default: 0		
	},
	tpgataw: { 
		type: Number,
		default: 0		
	},
	tpghtahwin: { 
		type: Number,
		default: 0		
	},
	tpgatawwin: { 
		type: Number,
		default: 0		
	},
	tpghtodds: { 
		type: Number,
		default: 0		
	},
	tpgatodds: { 
		type: Number,
		default: 0		
	},
	tpghtoddswin: { 
		type: Number,
		default: 0		
	},
	tpgatoddswin: { 
		type: Number,
		default: 0		
	},
	pghtrun: { 
		type: Array
	},
	pgatrun: { 
		type: Array
	}		
});

module.exports = mongoose.model('MBetsList', betListSchema);