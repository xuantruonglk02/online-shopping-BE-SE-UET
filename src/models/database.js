const mysql = require('mysql');

const config = require('../config/database.config');

var connection;
var interval;

connect();

function connect() {
    connection = mysql.createConnection(config);
    connection.connect((err) => {
        if (err) {
            return console.log(err);
        }
        console.log('Connected to database.');
    });

    interval = setInterval(() => {
        connection.query('SELECT 1 FROM users WHERE false');
    }, 50000);

    connection.on('error', (err) => {
        console.log('[database]', err);
        clearInterval(interval);
        setTimeout(() => {
            console.log('Reconnecting to database...');
            connect();
        }, 10000);
    });
}

function commitTransaction(connection, res) {
    connection.commit((err) => {
        if (err) {
            return connection.rollback(() => {
                return res.status(500).json({ success: 0, error: err.code });
            });
        }

        res.json({ success: 1 });
    });
}

module.exports = {
    connection,
    commitTransaction,
};
