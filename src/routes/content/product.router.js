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

router.get('/:productId', (req, res, next) => {
    productController.getProductById(req.params.productId, (err, result) => {
        if (err) {
            return next(createError(err));
        }
        if (!result) {
            return next(createError(404));
        }

        productController.checkUserBoughtProduct(
            req.session.userId,
            req.params.productId,
            (err, bought) => {
                result.price = new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'VND',
                }).format(result.price);
                res.render('product', {
                    title: result.name,
                    product: result,
                    bought: bought,
                });
            },
        );
    });
});

module.exports = router;
