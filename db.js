const mysql = require('mysql2');

const connection = mysql.createConnection({
	host: 'localhost',

	user: 'root',
	password: process.env.DB_PASSWORD,

	database: 'classwork2',
});

module.exports = connection;
