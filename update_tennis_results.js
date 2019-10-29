const fs = require('fs');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const JSONStream = require('JSONStream');
const TArchives = require('./models/TArchives');
const config = require('./config/config.js');
const extractsFolder = './extracts - HTML/';
const extractsToUpload = './extracts - Tennis/';

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
let startRecords, 
	noOfRecordsAdded;

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
		console.log('\nError. Path does not exist');
	}		
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
					console.log('\nArchive upload file ' +file +' deleted!');					
				});			
			});		
			db.close();			
			resolve();
		});		
	});	
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
				console.log('\nRetrieved filenames of saved webpage');
				resolve(fileNames);			
			} else {
				err = "\nError. Please store the results html file in the extracts - HTML folder first before running this script.";
				reject(err);
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
					fld_1 = $(elem).children("td:nth-child(1)").text().trim();
					game = $(elem).children("td:nth-child(2)").text().replace(' - ', ' vs ').replace('-', ' ').replace('.-', ' ').replace(' vs ', '-');
					results = $(elem).children("td:nth-child(3)").text().trim();
					odds_1 = $(elem).children("td:nth-child(4)").text().trim();		
					odds_2 = $(elem).children("td:nth-child(5)").text().trim();		
					if (game.length > 0 && results.length > 0 && odds_1.length > 0 && odds_2.length > 0) {
						goals = splitColumns(results, ':');	
						unit = 1;
						if (isNaN(parseInt(odds_1))) {odds_1 = unit.toString()};
						if (isNaN(parseInt(odds_2))) {odds_2 = unit.toString()};
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
								day: formattedDate,
								time: fld_1,	
								game: game.trim(),
								h_goals: h_goals.toString().trim(),
								a_goals: a_goals.toString().trim(),
								odds_1: odds_1.trim(),
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
					console.log("\nUpload file " + saveFile + " ready");
					resolve();					
				});			
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
						console.log('\nFile ' + file +' deleted!');
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
			console.log('\nFolder ' + folderName +' deleted!');			
		});
		db.close();			
		resolve();			
	});	
};
		
let promise = deleteProcessedFiles(extractsToUpload);
promise
.then(function() {
	return retrieveResults(extractsFolder, fileNames);
})
.then(function() {
	return processFileContents(fileNames);
})
.then(function() {
	return deleteExtractFiles(extractsFolder, folderNames);
})
.then(function(folderNames) {
	return deleteExtractFolders(extractsFolder, folderNames);
})
.catch(function(err) {	
	console.log(err);
	process.exit(-1);	
});
