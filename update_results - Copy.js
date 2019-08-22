const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const Archives = require('./models/Archives');
const config = require('./config/config.js');
const extractsFolder = './extracts - HTML/';
const extractsToUpload = './extracts - ToUpload/';

mongoose.connect(config.MONGODB_URI, { poolSize: config.DB_POOL_SIZE });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

const date = new Date();
date.setDate(date.getDate() - 1);
const formattedDate = date.toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
}).replace(/ /g, ' ');

let fileNames = [];
let folderNames = [];
let arrayOfResults = [];
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

let deleteFolderRecursive = function(path) {
	if (fs.existsSync(path)) {
		fs.readdirSync(path).forEach(function(file, index){
			var curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				deleteFolderRecursive(curPath);
			} else { // delete file
				fs.unlinkSync(curPath);
			}
		});
		fs.rmdirSync(path);
		return;
	} else {
		console.log('Error. Path does not exisit');
	}		
};

// read in filenames of saved webpage(s) into an array
let retrieveResults = function(extractsFolder, fileNames) {
	return new Promise(function(resolve, reject) {
		fs.readdir(extractsFolder, function(err, files) {
			if (err) {
				reject(err);
			}
			if (files.length > 0) {
				files.forEach(function(file) {
					if(file.indexOf(".html")>-1) {
						fileNames.push(file);
					}	
				});
				resolve(fileNames);			
			} else {
				reject("Please store the results html file in the extracts - HTML folder first before running this script");
			}
		});
	});
};

// extract the 'results' data from the saved webpage and store in 'extracts - ToUpload' folder
let processFileContents = function(fileNames) {
	return new Promise(function(resolve, reject) {
		fileNames.forEach(function(fileName) {
			let fileToRetrieve = extractsFolder+fileName;
			fs.readFile(fileToRetrieve, 'utf-8', function(err, data) {
				if (err) {
					reject(err);
				}				
				htmlData = [];
				const $ = cheerio.load(data);
				$('table.table-main tr')
				.each(function(i, elem){
					let fld_1 = $(elem).children("td:nth-child(1)").text().trim();
					let event = $(this).find("th.first2").text();
					if (event.length > 0) {
						dayEvent = splitColumns(event, '»');
					}
					results = $(elem).children("td:nth-child(3)").text().trim();
					goals = splitColumns(results, ':');					
					if (fld_1.length > 0 && !isEmpty(results) && !isEmpty(goals[0]) && !isEmpty(goals[1])) {
						if ($(elem).children("td").length > 6) {
							results = results,	
							odds_1 = $(elem).children("td:nth-child(4)").text(),
							odds_x = $(elem).children("td:nth-child(5)").text(),
							odds_2 = $(elem).children("td:nth-child(6)").text()							
						} else {
							results = "",	
							odds_1 = $(elem).children("td:nth-child(3)").text(),
							odds_x = $(elem).children("td:nth-child(4)").text(),
							odds_2 = $(elem).children("td:nth-child(5)").text()								
						}
						unit = 1;
						if (isNaN(parseInt(odds_1))) {odds_1 = unit.toString()};
						if (isNaN(parseInt(odds_x))) {odds_x = unit.toString()};
						if (isNaN(parseInt(odds_2))) {odds_2 = unit.toString()};						
						game = $(elem).children("td:nth-child(2)").text().replace(' - ', ' vs ').replace('-', ' ').replace('.-', ' ').replace(' vs ', '-');
						teams = splitColumns(game, '-');
//						goals = splitColumns(results, ':');
						h_goals = parseInt(goals[0]);
						a_goals = parseInt(goals[1]);
						odds_delta = (parseFloat(odds_1) - parseFloat(odds_2)).toFixed(2).toString();
						results_delta = parseInt(h_goals) - parseInt(a_goals);
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
				saveFile = extractsToUpload + 'Results_' + String(date.getTime()) + '.json';	
				fs.writeFile(saveFile, JSON.stringify(htmlData), function(err) {
					if(err) {
						reject(err);
					}
				});						
				console.log("Upload file " + saveFile + " ready");
				resolve();				
			});	
		});
	});
};

// delete the saved results html file from the extracts - HTML folder
let deleteExtractFiles = function(extractsFolder, folderNames) {
	return new Promise(function(resolve, reject) {
		fs.readdir(extractsFolder, function(err, files) {
			if (err) {
				reject(err);
			}
			files.forEach(function(file) {
				if(file.indexOf(".html")>-1) {
					let fileToDelete = extractsFolder + file;
					fs.unlink(fileToDelete, function (err) {
						if (err) {
							reject(err);
						}
						console.log('File ' + file +' deleted!');
					}); 
				} else {
					folderNames.push(file);
				}
			});
			resolve(folderNames);
		});
	});	
};

let deleteExtractFolders = function (extractsFolder, folderNames) {
	return new Promise(function(resolve, reject) {
		folderNames.forEach(function(folderName) {
			let subFolder = extractsFolder+folderName;
			deleteFolderRecursive(subFolder);
			console.log('Folder ' + folderName +' deleted!');			
		});	
		resolve();		
	});	
};

let updateArchives = function(extractsToUpload) {
	return new Promise(function(resolve, reject) {	
		fs
		.readdirSync(extractsToUpload)
		.forEach(function(file) {
			if (!file) {
				reject("No files prepared for upload process");
			}			
			process.stdout.write('Processing.');
//			console.log("Updating archives ...");
			const dataStreamFromFile = fs.createReadStream(extractsToUpload+file);
			dataStreamFromFile.pipe(JSONStream.parse('*'))
			.on('data', async (archiveData) => {
				arrayOfResults.push(archiveData);
				if (arrayOfResults.length === config.BATCH_INSERT_VALUE) {
					dataStreamFromFile.pause();
					await Archives.insertMany(arrayOfResults);
					arrayOfResults = [];
					process.stdout.write('.');
					dataStreamFromFile.resume();
				}
			});
			dataStreamFromFile
			.on('end', async () => {
				await Archives.insertMany(arrayOfResults); // left over data
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

let deleteProcessedFiles = function(extractsToUpload) {
	return new Promise(function(resolve, reject) {		
		fs.readdir(extractsToUpload, function(err, files) {
			if (err) {
				reject(err);
			}
			files.forEach(function(file) {
				let fileToDelete = extractsToUpload + file;				
				fs.unlink(fileToDelete, function(err) {
					if (err) {
						reject(err);
					}	
					console.log('Archive upload file ' +file +' deleted!');					
				});			
			});			
			resolve();
		});		
	});	
};
		
let promise = retrieveResults(extractsFolder, fileNames);
promise
.then(function(fileNames) {
	return processFileContents(fileNames);
})
.then(function() {
	return deleteExtractFiles(extractsFolder, folderNames);
})
.then(function(folderNames) {
	return deleteExtractFolders(extractsFolder, folderNames);
})
.then(function() {
	return updateArchives(extractsToUpload);
})
.then(function() {
	return deleteProcessedFiles(extractsToUpload);
})
.catch(function (err) {	
	console.log(err);
	return;
});
