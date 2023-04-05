const { redisClient } = require('../services/redis.service');

async function getQuantityOfProducts(req, res, next) {
    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    return res.json({ success: 1, result: { quantity: products.length } });
}

async function getAllProductsForCartMenu(req, res, next) {
    const userId = req.session.userId;

    let products = await getProductsInCart(userId);
    products = products.map((product) => ({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        thumbnail: product.thumbnail,
    }));

    return res.json({ success: 1, results: products });
}

async function addProduct(req, res) {
    // max_quantity is quantity in table product_has_sizes, text is text of size
    const { product_id } = req.body;
    const userId = req.session.userId;

    await redisClient.hSet(`cart:${userId}`, `${product_id}`, JSON.stringify(req.body));

    res.json({ success: 1 });
}

async function updateProductInCart(req, res) {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity || isNaN(quantity)) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    const foundProduct = products.find((product) => product.product_id == product_id);

    if (!foundProduct) return res.json({ success: 0, err: 'product_id not found' });

    await redisClient.hSet(
        `cart:${userId}`,
        `${product_id}`,
        JSON.stringify(foundProduct),
    );

    return res.json({ success: 1 });
}

async function getAllProducts(req, res) {
    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    res.json({ success: 1, results: products });
}

async function removeProduct(req, res) {
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    const products = await getProductsInCart(userId);
    const foundId = products.findIndex((product) => product.product_id == product_id);

    if (foundId < 0) return res.json({ success: 0, err: 'product_id not found' });

    await redisClient.hDel(`cart:${userId}`, `${product_id}`);
    return res.json({ success: 1 });
}

async function getProductsInCart(userId) {
    const cart = await redisClient.hGetAll(`cart:${userId}`);
    const products = Object.values(cart).map((objString) => JSON.parse(objString));
    return products;
}

module.exports = {
    getQuantityOfProducts,
    getAllProductsForCartMenu,
    getAllProducts,
    addProduct,
    removeProduct,
    updateProductInCart,
};
