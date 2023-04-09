const { connection } = require('../models/database');
const { redisClient } = require('../services/redis.service');

async function getQuantityOfProducts(req, res) {
    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    return res.json({ success: 1, result: { quantity: products.length } });
}

async function getAllProductsForCartMenu(req, res) {
    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    const productIds = products.map((product) => product.productId);
    getProductByIds(productIds, (err, products) => {
        if (err) {
            return res.status(500).json({ success: 0, error: err.code });
        }

        return res.json({ success: 1, results: products });
    });
}

async function addProduct(req, res) {
    // max_quantity is quantity in table product_has_sizes, text is text of size
    const { productId, sizeId, quantity } = req.body;
    if (!productId || !sizeId || !quantity) {
        return res.status(400).json({ success: 0 });
    }

    const query =
        'SELECT name, price, thumbnail ' + 'FROM products ' + 'WHERE product_id=?';
    connection.query(query, [productId], async (err, products) => {
        if (err) {
            return res.status(500).json({ success: 0, error: err });
        }
        if (!products.length) {
            return res.status(404).json({ success: 0 });
        }

        const query = 'SELECT text FROM sizes WHERE size_id=?';
        connection.query(query, [sizeId], async (err, sizes) => {
            if (err) {
                return res.status(500).json({ success: 0, error: err });
            }
            if (!sizes.length) {
                return res.status(404).json({ success: 0 });
            }

            const product = {
                name: products[0].name,
                price: products[0].price,
                thumbnail: products[0].thumbnail,
                sizeId,
                text: sizes[0].text,
                quantity,
            };
            const userId = req.session.userId;
            await redisClient.hSet(
                `cart:${userId}`,
                `${productId}`,
                JSON.stringify(product),
            );
            res.json({ success: 1 });
        });
    });
}

async function updateProductInCart(req, res) {
    const { productId, sizeId, quantity } = req.body;
    if (!productId || !sizeId || !quantity || isNaN(quantity)) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    const products = await getProductsInCart(userId);

    const foundProduct = products.find((product) => product.productId === productId);
    if (!foundProduct) {
        return res.json({ success: 0, err: 'productId not found' });
    }

    await redisClient.hSet(
        `cart:${userId}`,
        `${productId}`,
        JSON.stringify({ productId, sizeId, quantity }),
    );

    return res.json({ success: 1 });
}

async function getAllProducts(req, res) {
    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    res.json({ success: 1, results: products });
}

async function removeProduct(req, res) {
    const { productId } = req.body;
    if (!productId) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    const products = await getProductsInCart(userId);

    const foundId = products.findIndex((product) => product.productId === productId);
    if (foundId < 0) {
        return res.json({ success: 0, err: 'productId not found' });
    }

    await redisClient.hDel(`cart:${userId}`, `${productId}`);
    return res.json({ success: 1 });
}

async function getProductsInCart(userId) {
    const cart = await redisClient.hGetAll(`cart:${userId}`);
    const products = Object.entries(cart).map(([productId, objString]) => ({
        ...JSON.parse(objString),
        productId,
    }));
    return products;
}

function getProductByIds(productIds, callback) {
    const productIdsQuery = productIds.map((id) => '?').join(',');
    const query =
        `SELECT product_id, name, price, thumbnail ` +
        `FROM products WHERE product_id IN (${productIdsQuery})`;
    connection.query(query, [...productIds], (err, results) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

module.exports = {
    getQuantityOfProducts,
    getAllProductsForCartMenu,
    getAllProducts,
    addProduct,
    removeProduct,
    updateProductInCart,
};
