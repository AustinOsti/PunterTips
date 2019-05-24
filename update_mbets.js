const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const MBets = require('./models/MBetsList');
const config = require('./config/config.js');
const extractsFolder = './extracts - HTML/';
const extractsToUpload = './extracts - ManualPicks/';

mongoose.connect(config.MONGODB_URI, { poolSize: config.DB_POOL_SIZE });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

const date = new Date();
date.setDate(date.getDate()); // + 1);
const formattedDate = date.toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
}).replace(/ /g, ' ');

let fileNames = [];
let folderNames = [];
let arrayOfBets = [];
let file;

let splitColumns = function (str, splitChar) {
	colData = [];
	splitPos = str.indexOf(splitChar);
	firstCol = str.substring(0, splitPos);
	colData.push(firstCol);
	lastCol = str.substring(splitPos + 1, str.length);
	colData.push(lastCol);
	return colData;
};

let isEmpty = function (value) {
  return (value == null || value.length === 0);
};

let clearMBetList = function () {
	return new Promise(function(resolve, reject) {
		MBets.deleteMany({})
		.exec(function(err) {			
			if (err) { reject(err);}
			console.log('Cleared existing bet list');
			resolve();	
		});
	});				
};

let updateMBets = function(extractsToUpload) {
	return new Promise(function(resolve, reject) {	
		fs
		.readdirSync(extractsToUpload)
		.forEach(function(file) {
			if (!file) {
				reject("No files prepared for upload process");
			}			
			process.stdout.write('Processing.');
			const dataStreamFromFile = fs.createReadStream(extractsToUpload+file);
			dataStreamFromFile.pipe(JSONStream.parse('*'))
			.on('data', async (betData) => {
				arrayOfBets.push(betData);
				if (arrayOfBets.length === config.BATCH_INSERT_VALUE) {
					dataStreamFromFile.pause();
					await MBets.insertMany(arrayOfBets);
					arrayOfBets = [];
					process.stdout.write('.');
					dataStreamFromFile.resume();
				}
			});
			dataStreamFromFile
			.on('end', async () => {
				await MBets.insertMany(arrayOfBets); // left over data
				console.log('\nImport complete, closing connection...');
				db.close();
				resolve();
			});
			db.on('error', (err) => {
				console.error('MongoDB connection error: ', err);
				process.exit(-1);
				reject(err);
			});
		});
	});
};
		
let promise = clearMBetList();
promise
.then(function() {
	return updateMBets(extractsToUpload);
})
.catch(function (err) {	
	console.log(err);
	return;
});
