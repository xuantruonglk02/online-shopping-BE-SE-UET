const mysql = require('mysql2');

let dbPool;
let promisePool;

try {
    // Create the connection pool. The pool-specific settings are the defaults
    dbPool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
    });
    promisePool = dbPool.promise();
} catch (error) {
    throw error;
}

module.exports = {
    promisePool,
};
