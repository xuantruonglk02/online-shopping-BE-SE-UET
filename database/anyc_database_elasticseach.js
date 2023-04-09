require('dotenv').config();
const {connection} = require ("../src/models/database");

const {clientElasticSearch, indexName } = require("../src/services/elastichsearch.service")
// get all data
function getDataProducts(callback) {
    const queryAll = 'SELECT * FROM products';
    connection.query(queryAll, (err, result) => {
        if (err) {
            return callback(err, null);
        }

        callback(null, result);
    });
}

//insert data
function insertDataProductToEs() {
    getDataProducts((err, result) => {
        if (err) {
            console.log(err);
        }
        else {
            clientElasticSearch.index({
                index: indexName,
                body: result,
            }).then(err => {
                if (err) {
                    console.log(err);
                }
            })
        }
    })
}
insertDataProductToEs();
