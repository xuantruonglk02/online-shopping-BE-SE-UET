require('dotenv').config();
const { promisePool } = require('../src/models/database');
const { Client } = require('@elastic/elasticsearch');

const clientElasticSearch = new Client({
    node: `${process.env.ES_HOST}:${process.env.ES_PORT}`,
});
const indexName = process.env.ES_INDEX_NAME;
const indexSettings = {
    settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
    },
    mappings: {
        properties: {
            product_id: { type: 'text' },
            name: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                    raw: {
                        type: 'keyword',
                    },
                },
            },
            price: { type: 'integer' },
            sold: { type: 'integer' },
            quantity_of_rating: { type: 'integer' },
            rating: { type: 'float' },
            description: {
                type: 'text',
                analyzer: 'standard',
                fields: {
                    raw: {
                        type: 'keyword',
                    },
                },
            },
            thumbnail: { type: 'text' },
            created_at: { type: 'date' },
        },
    },
};

main();

async function main() {
    try {
        // drop existed product_index
        if (
            await clientElasticSearch.indices.exists({
                index: indexName,
            })
        ) {
            await clientElasticSearch.indices.delete({
                index: indexName,
            });
            console.info(`ES: Dropped index ${indexName}`);
        }

        // create new product_index
        await clientElasticSearch.indices.create({
            index: indexName,
            body: indexSettings,
        });

        // import data
        const rows = await getProductsDataFromMySql();
        console.info(`ES: Found ${rows.length} records of products`);

        for (let i = 0; i < rows.length; i++) {
            console.log(`ES: Indexing record ${i}`);
            await clientElasticSearch.index({
                index: indexName,
                body: rows[i],
            });
        }

        promisePool.end();
    } catch (error) {
        console.error(error);
    }
}

async function getProductsDataFromMySql() {
    try {
        const [rows, fields] = await promisePool.execute('SELECT * FROM products');
        return rows;
    } catch (error) {
        throw error;
    }
}
