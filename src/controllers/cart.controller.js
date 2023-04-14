const createError = require('http-errors');
const { promisePool } = require('../models/database');
const { redisClient } = require('../services/redis.service');

async function getProductByIds(productIds) {
    try {
        const productIdsQuery = productIds.map((id) => '?').join(',');
        const query =
            `SELECT product_id, name, price, thumbnail ` +
            `FROM products WHERE product_id IN (${productIdsQuery})`;
        const [rows, fields] = await promisePool.query(query, [...productIds]);
        return rows;
    } catch (error) {
        throw error;
    }
}

async function getQuantityOfProducts(req, res, next) {
    try {
        const userId = req.session.userId;
        const products = await getProductsInCart(userId);
        return res.json({ success: 1, result: { quantity: products.length } });
    } catch (error) {
        return next(createError(error));
    }
}

async function getAllProductsForCartMenu(req, res, next) {
    try {
        const userId = req.session.userId;
        const productsRedis = await getProductsInCart(userId);
        const productIds = productsRedis.map((product) => product.productId);
        const products = await getProductByIds(productIds);
        res.json({ success: 1, results: products });
    } catch (error) {
        return next(createError(error));
    }
}

async function addProduct(req, res, next) {
    try {
        // max_quantity is quantity in table product_has_sizes, text is text of size
        const { productId, sizeId, quantity } = req.body;
        if (!productId || !sizeId || !quantity) {
            return res.status(400).json({ success: 0 });
        }

        const [products, fields] = await promisePool.query(
            'SELECT name, price, thumbnail FROM products WHERE product_id=?',
            [productId],
        );
        if (!products.length) {
            return res.status(404).json({ success: 0 });
        }

        const [sizes, _] = await promisePool.query(
            'SELECT text FROM sizes WHERE size_id=?',
            [sizeId],
        );
        if (!sizes.length) {
            return res.status(404).json({ success: 0 });
        }

        const userId = req.session.userId;
        const product = {
            name: products?.[0]?.name,
            price: products?.[0]?.price,
            thumbnail: products?.[0]?.thumbnail,
            sizeId,
            text: sizes?.[0]?.text,
            quantity,
        };
        await redisClient.hSet(`cart:${userId}`, `${productId}`, JSON.stringify(product));
        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

async function updateProductInCart(req, res, next) {
    try {
        // const { productId, sizeId, quantity } = req.body;
        // if (!productId || !sizeId || !quantity || isNaN(quantity)) {
        //     return res.status(400).json({ success: 0 });
        // }
        let { list } = req.body;
        list = JSON.parse(list);

        const userId = req.session.userId;
        const productsRedis = await getProductsInCart(userId);

        const allFound = list.every((e) =>
            productsRedis.find(
                (product) => product.productId.toString() === e.productId.toString(),
            ),
        );
        if (!allFound) {
            return res.json({ success: 0, err: 'productId not found' });
        }

        const productsQuery = `SELECT product_id, name, price, thumbnail FROM products WHERE product_id IN (${list
            .map((e) => '?')
            .join(',')})`;
        const [products, fields] = await promisePool.query(
            productsQuery,
            list.map((e) => e.productId),
        );
        if (!products.length) {
            return res.status(404).json({ success: 0 });
        }

        const sizesQuery = `SELECT text FROM sizes WHERE size_id IN (${list
            .map((e) => '?')
            .join(',')})`;
        const [sizes, _] = await promisePool.query(
            sizesQuery,
            list.map((e) => e.sizeId),
        );
        if (!sizes.length) {
            return res.status(404).json({ success: 0 });
        }

        const updateProducts = products.map((product) => {
            const e = list.find(
                (e) => e.productId.toString() === product.product_id.toString(),
            );
            return {
                productId: product.product_id,
                name: product.name,
                price: product.price,
                thumbnail: product.thumbnail,
                sizeId,
                text: sizes.find(
                    (size) => size.sizeId.toString() === e?.sizeId?.toString(),
                )?.text,
                quantity: e?.quantity,
            };
        });

        await Promise.all(
            updateProducts.map((product) =>
                redisClient.hSet(
                    `cart:${userId}`,
                    `${product.productId}`,
                    JSON.stringify(product),
                ),
            ),
        );
        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

async function getAllProducts(req, res, next) {
    try {
        const userId = req.session.userId;
        const products = await getProductsInCart(userId);
        res.json({ success: 1, results: products });
    } catch (error) {
        return next(createError(error));
    }
}

async function removeProduct(req, res, next) {
    try {
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
    } catch (error) {
        return next(createError(error));
    }
}

async function getProductsInCart(userId) {
    try {
        const cart = await redisClient.hGetAll(`cart:${userId}`);
        const products = Object.entries(cart).map(([productId, objString]) => ({
            ...JSON.parse(objString),
            productId,
        }));
        return products;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getQuantityOfProducts,
    getAllProductsForCartMenu,
    getAllProducts,
    addProduct,
    removeProduct,
    updateProductInCart,
};
