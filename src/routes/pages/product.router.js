const express = require('express');
const createError = require('http-errors');

const productController = require('../../controllers/product.controller');

const router = express.Router();

router.get('/search', (req, res, next) => {
    res.render('search', {
        title: req.query.keyword,
        keyword: req.query.keyword,
    });
});

router.get('/category/:categoryId', (req, res, next) => {
    res.render('category', {
        title: req.query.name,
    });
});

router.get('/:productId', async (req, res, next) => {
    try {
        const product = await productController.getProductById(req.params.productId);
        if (!product) {
            return next(createError(404));
        }

        const bought = await productController.checkUserBoughtProduct(
            req.session.userId,
            req.params.productId,
        );

        product.price = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'VND',
        }).format(product.price);
        res.render('product', {
            title: product.name,
            product: product,
            bought: bought,
        });
    } catch (error) {
        return next(createError(error));
    }
});

module.exports = router;
