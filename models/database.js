const mysql = require('mysql');

const config = require('../config/database.config');

const connection = mysql.createConnection(config);
connection.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to database.');
});

function commitTransaction(connection, res) {
  connection.commit((err) => {
    if (err) {
      console.log(err);
      return connection.rollback(() => { return res.json({ success: 0 }); });
    }

    res.json({ success: 1 });
  });
}

module.exports = {
  connection,
  commitTransaction
};
