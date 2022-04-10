const mysql = require('mysql');

const config = require('../config/database.config');

const connection = mysql.createConnection(config);
connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database.');
});

module.exports = connection;
