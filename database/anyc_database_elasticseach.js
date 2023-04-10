require('dotenv').config();
const { connection } = require('../src/models/database');

const {
    clientElasticSearch,
    indexName,
} = require('../src/services/elastichsearch.service');

// drop index
/* Delete index */
clientElasticSearch.indices
    .delete({
        index: indexName,
    })
    .then(
        function (resp) {
            console.log('Drop index');
            console.log(JSON.stringify(resp, null, 4));
        },
        function (err) {
            console.log(err);
        },
    );

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
    getDataProducts(async (err, result) => {
        if (err) {
            console.log(err);
        } else {
            await Promise.all(
                result.map((product) =>
                    clientElasticSearch
                        .index({
                            index: indexName,
                            body: product,
                        })
                        .then((err) => {
                            if (err) {
                                console.log(err);
                            }
                        }),
                ),
            );
        }
    });
}
insertDataProductToEs();
