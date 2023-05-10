const express = require('express');
const createError = require('http-errors');

const { getUserId } = require('../../controllers/user.controller');

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
            console.log(err);
            return next(createError(500));
        }
        if (!result) {
            return next(createError(404));
        }

        productController.checkUserBoughtProduct(
            getUserId(req.cookies['x-access-token']),
            req.params.productId,
            (err, bought) => {
                result.price = new Intl.NumberFormat('de-DE', {
                    style: 'currency',
                    currency: 'VND',
                }).format(result.price);
                console.log(result);
                res.render('product', {
                    title: result.name,
                    product: result,
                    bought: bought,
                });
            }
        );
    });
});

module.exports = router;
