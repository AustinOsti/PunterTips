let express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),	
	morgan = require('morgan'),
	mongoose = require('mongoose'),
	fs = require('fs'),
	util = require('util'),	
	config = require('./config/database'),
	MBetsList = require('./models/MBetsList'),	
	Archive = require('./models/Archives'),
	MBets = require('./models/MBets'),
	port = process.env.PORT || 8080;
	
const extractsAnalysis = './extracts - Analysis/';

const dateFilter = "2019-06-24T21:00:00.000Z";
let betsFilter = {"$eq": new Date(dateFilter)};
let archiveFilter = {"$lt": new Date(dateFilter)};

// send console.log to file ...
let log_file = fs.createWriteStream(extractsAnalysis + 'mbetanalysis_'+dateFilter.substr(0, 13) +'.txt', {flags : 'w'});
let log_stdout = process.stdout;

console.log = function(d) {
	log_file.write(util.format(d) + '\n');
	log_stdout.write(util.format(d) + '\n');
};
 
mongoose.Promise = global.Promise;

// use script below to debug mongoose ...
// mongoose.set('debug', true);	

// get our request parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// log to console
app.use(morgan('dev'));

// connect to database
mongoose.connect(config.database, function(err) {
	if (err) {
		console.log(err);
	} else {
//		console.log("database listening on port "+ port);
	}
});

let betList0 = [];
let betCriteria = {};
let archiveCriteria = {};

if (dateFilter) {
	betCriteria.day = betsFilter;
	archiveCriteria.day = archiveFilter
}
			
// 0. Count bet list
function countBetList() {
	return new Promise(function(resolve, reject) {
		Archive.count({
			$and: [
				betCriteria
			]
		})
		.exec(function(err, bets) {			
			if (err) { reject(err);}
			console.log('No. on bet list: '+bets);
			resolve();	
		});
	});				
};

// 1. Get bet list
function getBetList(betList0) {
	return new Promise(function(resolve, reject) {
		MBetsList.find({})
		.exec(function(err, bets) {			
			if (err) { reject(err);}
			bets.forEach(function(bet){
				betList0.push(bet);
			});
			resolve(betList0);	
		});
	});
};

// 2. No. of times in archive where home team featured - thtgames
function countGamesForHTeam(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function thtgamesFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{home: betTeam.home},
							{away: betTeam.home}				
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'thtgames': noOfDocs});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(thtgamesFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});
	});				
};

// 3. No. of times in archive where away team featured - tatgames
function countGamesForATeam(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tatgamesFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{home: betTeam.away},
							{away: betTeam.away}				
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'tatgames': noOfDocs});
					resolve(betTeam);					
				});			
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tatgamesFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 4. No. of previous encounters for the teams - tpgames
function countGamesForBothTeams(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgamesFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [				
							{$and: [
								{home: betTeam.home},
								{away: betTeam.away}							
							]}, 
							{$and: [
								{home: betTeam.away},
								{away: betTeam.home}
							]}					
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'tpgames': noOfDocs});	
					resolve(betTeam);
				});			
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgamesFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});			
	});				
};

// 5. % of previous encounters where home team wins (divide by no. 4) - pghtwins
function previousGamesHTWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function pghtwinsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.home},
								{away: betTeam.away},							
								{h_status: true}
							]},
							{$and: [
								{home: betTeam.away},
								{away: betTeam.home},							
								{a_status: true}
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let pghtwins = (betTeam.tpgames == 0) ? 0 : ((noOfDocs/betTeam.tpgames)*100).toFixed(2);
					Object.assign(betTeam, {'pghtwins': pghtwins});
					resolve(betTeam);
				});			
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(pghtwinsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});	
	});				
};

// 6. % of previous enccounters draws (divide by no. 4) - pgdraws
function previousGamesDraws(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function pgdrawsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.home},
								{away: betTeam.away},							
								{d_status: true}
							]},
							{$and: [
								{home: betTeam.away},
								{away: betTeam.home},							
								{d_status: true}
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let pgdraws = (betTeam.tpgames == 0) ? 0 : ((noOfDocs/betTeam.tpgames)*100).toFixed(2);
					Object.assign(betTeam, {'pgdraws': pgdraws});
					resolve(betTeam);
				});			
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(pgdrawsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});	
	});				
};

// 7. % of previous enccounters where away team wins (divide by no. 4) - pgatwins
function previousGamesATWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function pgatwinsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.home},
								{away: betTeam.away},							
								{a_status: true}
							]},
							{$and: [
								{home: betTeam.away},
								{away: betTeam.home},							
								{h_status: true}
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {	
					if (err) { reject(err);}
					let pgatwins = (betTeam.tpgames == 0) ? 0 : ((noOfDocs/betTeam.tpgames)*100).toFixed(2);
					Object.assign(betTeam, {'pgatwins': pgatwins});
					resolve(betTeam);
				});		
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(pgatwinsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 8. % of total previous games where home team wins (divide by no. 2) - tpghtwins
function allPreviousGamesHTWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtwinsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.home},
								{h_status: true},
								{d_status: false},
								{a_status: false}							
							]},
							{$and: [
								{away: betTeam.home},
								{h_status: false},
								{d_status: false},
								{a_status: true}
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpghtwins = (betTeam.thtgames == 0) ? 0 : ((noOfDocs/betTeam.thtgames)*100).toFixed(2);
					Object.assign(betTeam, {'tpghtwins': tpghtwins});
					resolve(betTeam);
				});	
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtwinsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 9. % of total previous games where home team draws (divide by no. 2) - tpghtdraws
function allPreviousGamesHTDraws(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtdrawsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.home},
								{h_status: false},
								{d_status: true},
								{a_status: false}
							]},
							{$and: [
								{away: betTeam.home},
								{h_status: false},
								{d_status: true},
								{a_status: false}							
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpghtdraws = (betTeam.thtgames == 0) ? 0 : ((noOfDocs/betTeam.thtgames)*100).toFixed(2);
					Object.assign(betTeam, {'tpghtdraws': tpghtdraws});
					resolve(betTeam);
				});	
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtdrawsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});					
};

// 10. % of total previous games where home team losses (divide by no. 2) - tpghtloss
function allPreviousGamesHTLoss(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtlossFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.home},
								{h_status: false},
								{d_status: false},
								{a_status: true}							
							]},
							{$and: [
								{away: betTeam.home},
								{h_status: true},
								{d_status: false},
								{a_status: false}							
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpghtloss = (betTeam.thtgames == 0) ? 0 : ((noOfDocs/betTeam.thtgames)*100).toFixed(2);
					Object.assign(betTeam, {'tpghtloss': tpghtloss});
					resolve(betTeam);
				});	
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtlossFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 11. % of total previous games where away team wins (divide by no. 3) - tpgatwins
function allPreviousGamesATWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatwinsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.away},
								{h_status: true},
								{d_status: false},
								{a_status: false}								
							]},
							{$and: [
								{away: betTeam.away},
								{h_status: false},
								{d_status: false},							
								{a_status: true}							
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpgatwins = (betTeam.tatgames == 0) ? 0 : ((noOfDocs/betTeam.tatgames)*100).toFixed(2);
					Object.assign(betTeam, {'tpgatwins': tpgatwins});
					resolve(betTeam);
				});		
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatwinsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 12.  % of total previous games where away team draws (divide by no. 3) - tpgatdraws
function allPreviousGamesATDraws(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatdrawsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.away},
								{h_status: false},							
								{d_status: true},
								{a_status: false}							
							]},
							{$and: [
								{away: betTeam.away},
								{h_status: false},							
								{d_status: true},
								{a_status: false} 
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpgatdraws = (betTeam.tatgames == 0) ? 0 : ((noOfDocs/betTeam.tatgames)*100).toFixed(2);
					Object.assign(betTeam, {'tpgatdraws': tpgatdraws});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatdrawsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});	
	});					
};

// 13.  % of total previous games where away team losses (divide by no. 3) - tpgatloss
function allPreviousGamesATLoss(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatlossFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{$and: [
								{home: betTeam.away},
								{h_status: false},							
								{d_status: false},
								{a_status: true}						
							]},
							{$and: [
								{away: betTeam.away},
								{h_status: true},							
								{d_status: false},
								{a_status: false}						
							]}
						]}				
					]
				})
				.exec(function(err, noOfDocs) {	
					if (err) { reject(err);}			
					let tpgatloss = (betTeam.tatgames == 0) ? 0 : ((noOfDocs/betTeam.tatgames)*100).toFixed(2);
					Object.assign(betTeam, {'tpgatloss': tpgatloss});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatlossFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});					
};

// 14.  no of previous games home team played at home - tpghtah
function allHomeGamesHT(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtahFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{home: betTeam.home}			
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'tpghtah': noOfDocs});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtahFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});
};

// 15.  no of previous games away team played at away - tpgataw
function allAwayGamesAT(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatawFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{away: betTeam.away}			
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'tpgataw': noOfDocs});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatawFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});			
	});
};

// 16.  % of previous games played at home where home team wins (divide by no. 14) - tpghtahwin
function allHomeGamesHTWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtahwinFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{home: betTeam.home},
						{h_status: true}		
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpghtahwin = (betTeam.tpghtah == 0) ? 0 : ((noOfDocs/betTeam.tpghtah)*100).toFixed(2);
					Object.assign(betTeam, {'tpghtahwin': tpghtahwin});
					resolve(betTeam);
				});			
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtahwinFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});			
	});
};

// 17.  % of previous games played away where away team wins (divide by no. 15) - tpgatawwin
function allAwayGamesATWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatawwinFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.count({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{away: betTeam.away},
						{a_status: true}		
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpgatawwin = (betTeam.tpgataw == 0) ? 0 : ((noOfDocs/betTeam.tpgataw)*100).toFixed(2);
					Object.assign(betTeam, {'tpgatawwin': tpgatawwin});
					resolve(betTeam);
				});			
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatawwinFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});			
	});
};

// 18.  No. of previous games played by home team where the ODDS where to their favour - tpghtodds
function oddsHTWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtoddsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$or: [
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{home: betTeam.home},
							{odds_delta: {$lt: 0}}
						]},
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{away: betTeam.home},
							{odds_delta: {$gt: 0}}
						]}					
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'tpghtodds': noOfDocs});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtoddsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});			
	});
};

// 19.  No. of previous games played by away team where the ODDS where to their favour - tpgatodds
function oddsATWins(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatoddsFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$or: [
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{home: betTeam.away},
							{odds_delta: {$lt: 0}}
						]},
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{away: betTeam.away},
							{odds_delta: {$gt: 0}}
						]}					
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					Object.assign(betTeam, {'tpgatodds': noOfDocs});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatoddsFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});
};

// 20.  % of previous games played by home team where the ODDS where to their favour that they won (divide by no. 18) - tpghtoddswin
function oddsHTWinsWon(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpghtoddswinFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$or: [
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{home: betTeam.home},
							{odds_delta: {$lt: 0}},
							{h_status: true}
						]},
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{away: betTeam.home},
							{odds_delta: {$gt: 0}},
							{a_status: true}
						]}					
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpghtoddswin = (betTeam.tpghtodds == 0) ? 0 : ((noOfDocs/betTeam.tpghtodds)*100).toFixed(2);
					Object.assign(betTeam, {'tpghtoddswin': tpghtoddswin});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpghtoddswinFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});
};

// 21.  % of previous games played by away team where the ODDS where to their favour that they won (divide by no. 19) - tpgatoddswin
function oddsATWinsWon(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function tpgatoddswinFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive.count({
					$or: [
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{home: betTeam.away},
							{odds_delta: {$lt: 0}},
							{h_status: true}
						]},
						{$and: [
							archiveCriteria,
							{country: betTeam.country},
							{away: betTeam.away},
							{odds_delta: {$gt: 0}},
							{a_status: true}
						]}					
					]
				})
				.exec(function(err, noOfDocs) {			
					if (err) { reject(err);}
					let tpgatoddswin = (betTeam.tpgatodds == 0) ? 0 : ((noOfDocs/betTeam.tpgatodds)*100).toFixed(2);
					Object.assign(betTeam, {'tpgatoddswin': tpgatoddswin});
					resolve(betTeam);
				});				
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(tpgatoddswinFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});
};

// 22. get performance (WDL) of the home teams games - pghtrun
function allPreviousGamesHTRun(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function pghtrunFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.find({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{home: betTeam.home},
							{away: betTeam.home}
						]}				
					]
				})
				.sort('-day')
				.exec(function(err, docs) {			
					if (err) { reject(err);}
					let pghtrun = [];
					docs.forEach (function(doc) {
						let goalDiff, gameStatus;
						goalDiff = (doc.h_goals - doc.a_goals);
						if (doc.home === betTeam.home) {
							if (goalDiff<0) {
								gameStatus = "L";
							} else if (goalDiff>0) {
								gameStatus = "W";
							} else {
								gameStatus = "D";
							}							
						} else {
							if (goalDiff>0) {
								gameStatus = "L";
							} else if (goalDiff<0) {
								gameStatus = "W";
							} else {
								gameStatus = "D";
							}							
						}
						pghtrun.push(gameStatus)
					});
					if (pghtrun.length > 6) {
						pghtrun.length = 6;
					}
					Object.assign(betTeam, {'pghtrun': pghtrun});
					resolve(betTeam);
				});	
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(pghtrunFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 23. get performance (WDL) of the away teams games - pgatrun
function allPreviousGamesATRun(betList0) {
	return new Promise(function(resolve, reject) {
		let loopPromises = [];
		function pgatrunFn(betTeam) {
			return new Promise(function(resolve, reject) {
				Archive
				.find({
					$and: [
						archiveCriteria,
						{country: betTeam.country},
						{$or: [
							{home: betTeam.away},
							{away: betTeam.away}
						]}				
					]
				})
				.sort('-day')
				.exec(function(err, docs) {			
					if (err) { reject(err);}
					let pgatrun = [];
					docs.forEach (function(doc) {
						let goalDiff, gameStatus;
						goalDiff = (doc.h_goals - doc.a_goals);
						if (doc.home === betTeam.away) {
							if (goalDiff<0) {
								gameStatus = "L";
							} else if (goalDiff>0) {
								gameStatus = "W";
							} else {
								gameStatus = "D";
							}							
						} else {
							if (goalDiff>0) {
								gameStatus = "L";
							} else if (goalDiff<0) {
								gameStatus = "W";
							} else {
								gameStatus = "D";
							}							
						}
						pgatrun.push(gameStatus)
					});
					if (pgatrun.length > 6) {
						pgatrun.length = 6;
					}
					Object.assign(betTeam, {'pgatrun': pgatrun});
					resolve(betTeam);
				});	
			});
		};
		
		betList0.forEach(function (betTeam) {
			loopPromises.push(pgatrunFn(betTeam));
		});
		
		Promise.all(loopPromises)
		.then (function() {
			resolve(betList0);
		});		
	});				
};

// 24. store analysis in txt file and bets database.
function listBetList(betList0) {
	return new Promise(function(resolve, reject) {
		betList0.forEach(function (betTeam) {
			console.log(betTeam.day+'»'+betTeam.country+'»'+betTeam.league+'»'+betTeam.game+'»'+betTeam.home+'»'+betTeam.away+'»'+betTeam.h_goals+'»'+betTeam.a_goals+'»'+betTeam.odds_1+'»'+betTeam.odds_x+'»'+betTeam.odds_2+'»'+betTeam.odds_delta+'»'+betTeam.thtgames+'»'+betTeam.tatgames+'»'+betTeam.tpgames+'»'+betTeam.tpghtah+'»'+betTeam.tpgataw+'»'+betTeam.pghtwins+'»'+betTeam.pgdraws+'»'+betTeam.pgatwins+'»'+betTeam.tpghtwins+'»'+betTeam.tpghtdraws+'»'+betTeam.tpghtloss+'»'+betTeam.tpgatwins+'»'+betTeam.tpgatdraws+'»'+betTeam.tpgatloss+'»'+betTeam.tpghtahwin+'»'+betTeam.tpgatawwin+'»'+betTeam.tpghtodds+'»'+betTeam.tpgatodds+'»'+betTeam.tpghtoddswin+'»'+betTeam.tpgatoddswin+'»'+betTeam.pghtrun+'»'+betTeam.pgatrun);
		});
//		MBets.insertMany(betList0);
		resolve();
	});
};
				
( function generateBetList() {
	let promise = getBetList(betList0);
	promise
	.then (function (betList0) {
 		return countGamesForHTeam(betList0);
	})	
 	.then (function (betList0) {
		return countGamesForATeam(betList0);
	})		
 	.then (function (betList0) {
		return countGamesForBothTeams(betList0);
	})
 	.then (function (betList0) {
		return previousGamesHTWins(betList0);
	})	
	.then (function (betList0) {
		return previousGamesDraws(betList0);
	})	
	.then (function (betList0) {
		return previousGamesATWins(betList0);
	})	
	.then (function (betList0) {
		return allPreviousGamesHTWins(betList0);
	})
	.then (function (betList0) {
		return allPreviousGamesHTDraws(betList0);
	})
	.then (function (betList0) {
		return allPreviousGamesHTLoss(betList0);
	})	
	.then (function (betList0) {
		return allPreviousGamesATWins(betList0);
	})
	.then (function (betList0) {
		return allPreviousGamesATDraws(betList0);
	})
	.then (function (betList0) {
		return allPreviousGamesATLoss(betList0);
	})
	.then (function (betList0) {
		return allHomeGamesHT(betList0);
	})
	.then (function (betList0) {
		return allAwayGamesAT(betList0);
	})
	.then (function (betList0) {
		return allHomeGamesHTWins(betList0);
	})
	.then (function (betList0) {
		return allAwayGamesATWins(betList0);
	})	
	.then (function (betList0) {
		return oddsHTWins(betList0);
	})		
	.then (function (betList0) {
		return oddsATWins(betList0);
	})	
	.then (function (betList0) {
		return oddsHTWinsWon(betList0);
	})	
	.then (function (betList0) {
		return oddsATWinsWon(betList0);
	})		
	.then (function (betList0) {
		return allPreviousGamesHTRun(betList0);
	})	
	.then (function (betList0) {
		return allPreviousGamesATRun(betList0);
	})	
	.then (function (betList0) {
		return listBetList(betList0);
	})	
	.catch(function (err) {	
		console.log(err);
		return;
	});
})();

// Start the server 
app.set('port', process.env.PORT || 8080);
app.listen(app.get('port'), function () {
//    console.log('Express server listening on port ' + app.get('port'));
});
