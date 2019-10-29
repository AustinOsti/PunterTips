var dataDevDB = 'mongodb://localhost/punter-tips-dev'; 
var dataProdDB = 'mongodb://austinOsti:Shiramimi1965@ds161262.mlab.com:61262/archives';

module.exports = {
//	'secret': 'surebets',
	'database': dataDevDB, // dataProdDB
	BATCH_INSERT_VALUE: 1000,
	DB_POOL_SIZE: 1000,
	MONGODB_URI: 'mongodb://127.0.0.1/punter-tips-dev'	
};