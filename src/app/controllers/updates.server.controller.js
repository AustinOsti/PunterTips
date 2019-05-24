'use strict';

const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const fs = require('fs');
const cheerio = require('cheerio');
const Nightmare = require('nightmare');
const _ = require('lodash');

const nightmare = Nightmare({
	show: true
});

const db = mongoose.connection;
const errorHandler = require('./errors.server.controller');
const extractsFolder = './extracts/';

let User = mongoose.model('User');	
let	Archive = mongoose.model('Archive');
let arrayOfBets = [];

const date = new Date();
date.setDate(date.getDate() - 1);
const formattedDate = date.toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
}).replace(/ /g, ' ');

let splitColumns = function (str, splitChar) {
	let colData = [];
	let splitPos = str.indexOf(splitChar);
	let firstCol = str.substring(0, splitPos);
	colData.push(firstCol);
	let lastCol = str.substring(splitPos + 1, str.length);
	colData.push(lastCol);
	return colData;
};

let isEmpty = function (value) {
  return (value == null || value.length === 0);
};

/**
 * Show the current Update
 */
exports.read = function(req, res) {
	res.jsonp(req.update);
};

exports.listDayResults = function(req, res) { 

 	let user = req.query;
	console.log(user);
	
	const url = 'https://www.oddsportal.com/matches/soccer/20190413/';
	
	let pageOptions = {
		page: user.pageNo || 0,
		limit: user.limit || 10
	}
	
	let getWebsiteContents = function(url) {
		return new Promise(function(resolve, reject) {
			nightmare
			.goto(url)
			.wait('body')		
			.evaluate(()=> document.querySelector('body').innerHTML)
			.end()		
			.then ((data)=> {
//				console.log(data);
				resolve(data);
			})
			.catch ((err)=>{
				reject(err);
			});
		});
	};

	let processWebsiteContents = function(data) {
		return new Promise(function(resolve, reject) {			
			let htmlData = [];
			let odds_1;
			let odds_x;
			let odds_2;
			let dayEvent;
			const $ = cheerio.load(data);
			$('table.table-main tr')
			.each(function(i, elem){
				let fld_1 = $(elem).children("td:nth-child(1)").text().trim();
				let event = $(this).find("th.first2").text();
				if (event.length > 0) {
					dayEvent = splitColumns(event, '»');
				}
				let results = $(elem).children("td:nth-child(3)").text().trim();
				let goals = splitColumns(results, ':');				
				if (fld_1.length > 0 && !isEmpty(results) && !isEmpty(goals[0]) && !isEmpty(goals[1])) {
					if ($(elem).children("td").length > 6) {
						results = results;	
						odds_1 = $(elem).children("td:nth-child(4)").text();
						odds_x = $(elem).children("td:nth-child(5)").text();
						odds_2 = $(elem).children("td:nth-child(6)").text();						
					} else {
						results = "";	
						odds_1 = $(elem).children("td:nth-child(3)").text();
						odds_x = $(elem).children("td:nth-child(4)").text();
						odds_2 = $(elem).children("td:nth-child(5)").text();							
					}
					let unit = 1;
					if (isNaN(parseInt(odds_1))) {odds_1 = unit.toString()};
					if (isNaN(parseInt(odds_x))) {odds_x = unit.toString()};
					if (isNaN(parseInt(odds_2))) {odds_2 = unit.toString()};						
					let game = $(elem).children("td:nth-child(2)").text().replace(' - ', ' vs ').replace('-', ' ').replace('.-', ' ').replace(' vs ', '-');
					let teams = splitColumns(game, '-');
//					let goals = splitColumns(results, ':');
					let h_goals = parseInt(goals[0]);
					let a_goals = parseInt(goals[1]);
					let odds_delta = (parseFloat(odds_1) - parseFloat(odds_2)).toFixed(2).toString();
					let results_delta = parseInt(h_goals) - parseInt(a_goals);
					let h_status;
					let d_status;
					let a_status;
					if (results_delta > 0) {
						h_status = true;
						d_status = false;
						a_status = false;
					} else if (results_delta === 0){
						h_status = false;
						d_status = true;
						a_status = false;							
					} else {
						h_status = false;
						d_status = false;
						a_status = true;							
					}
					if (!isNaN(h_goals) && !isNaN(a_goals)) {
						htmlData.push({
							country: dayEvent[0].trim(),
							league: dayEvent[1].trim(),
							day: formattedDate,
							time: fld_1,	
							game: game.trim(),
							home: teams[0].trim(),
							away: teams[1].trim(),
							h_goals: h_goals.toString().trim(),
							a_goals: a_goals.toString().trim(),
							odds_1: odds_1.trim(),
							odds_x: odds_x.trim(),
							odds_2: odds_2.trim(),
							odds_delta: odds_delta.trim(),
							h_status: h_status,
							d_status: d_status,
							a_status: a_status
						});							
					}						
				}	
			});	
			let saveFile = extractsFolder + 'Results_' + String(date.getTime()) + '.json';	
			fs.writeFile(saveFile, JSON.stringify(htmlData), function(err) {
				if(err) {
					reject(err);
				}
				resolve(htmlData);				
			});				
		});
	};

	var promise = getWebsiteContents(url);
	promise.then(function(htmlData) {
		return processWebsiteContents(htmlData);
	})
	.then (function(jsonData) {
		console.log(jsonData);
		res.status(200).jsonp(jsonData);	
	})
	.catch(function (err) {	
		console.log(err);
		return res.status(400).send({
			message: 'Something went wrong. Please retry.'
		});
	});

};

exports.postDayResults = function(req, res) {

	fs.readdirSync(extractsFolder)
	.forEach(function(file) {
		db.on('open', () => {
//			console.log('Connected to mongo server.\n');
			process.stdout.write('Processing.');
			const dataStreamFromFile = fs.createReadStream(extractsFolder+file);
			dataStreamFromFile
			.pipe(JSONStream.parse('*'))
			.on('data', function(betData) {
				arrayOfBets.push(betData);
				Archives.insertMany(arrayOfBets);			
			});
			dataStreamFromFile
			.on('end', function (){
//				console.log('\nImport complete, closing connection...');
				db.close();
				process.exit(0);
				res.status(200)
			});		
		});

		db.on('error', (err) => {
			console.error('MongoDB connection error: ', err);
			process.exit(-1);
			return res.status(400).send({
				message: 'Something went wrong. Please retry.'
			});			
		});
	});
	
};

/**
 * Update middleware
 */
exports.updateByID = function(req, res, next, id) { 
	Update.findById(id).populate('user', 'displayName').exec(function(err, update) {
		if (err) return next(err);
		if (! update) return next(new Error('Failed to load Update ' + id));
		req.update = update ;
		next();
	});
};

/**
 * Update authorization middleware
 */
exports.hasAuthorization = function(req, res, next) {
	if (req.update.user.id !== req.user.id) {
		return res.status(403).send('User is not authorized');
	}
	next();
};
