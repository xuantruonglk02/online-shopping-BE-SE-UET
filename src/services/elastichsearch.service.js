
const { Client } = require('@elastic/elasticsearch');
const expressWinston = require("express-winston");
const winston = require("winston");
const path = require("path");
const clientElasticSearch = new Client({ node: 'http://localhost:9200' });


//create index elastic
const indexSettings = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
    },
    mappings: {
        properties: {
            product_id: {type: 'text'},
            name: {type: 'text'},
            price: {type: 'integer'},
            sold: {type: 'integer'},
            quantity_of_rating: {type: 'integer'},
            rating: {type: 'float'},
            description: {type: 'text'},
            thumbnail: {type: 'text'},
            created_at: {type: 'datetime'},


        }
    }
}

const indexName = 'product_index';
clientElasticSearch.indices.create({index: indexName, body: indexSettings })
    .then(response => {
        console.log('oki luôn em ơi');
    })
    .catch(err => {
        expressWinston.errorLogger({
            transports: [
                new winston.transports.File({
                    filename: path.join(__dirname, '../log/error.log'),
                    level: 'error',
                }),
            ],
            format: winston.format.combine(winston.format.colorize(), winston.format.json()),
        })
    })
module.exports = { clientElasticSearch, indexName };