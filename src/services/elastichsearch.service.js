const { Client } = require('@elastic/elasticsearch');

const clientElasticSearch = new Client({
    node: `${process.env.ES_HOST}:${process.env.ES_PORT}`,
});
const indexName = process.env.ES_INDEX_NAME;

module.exports = { clientElasticSearch, indexName };
