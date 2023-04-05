const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');
require('express-async-errors');

const router = express.Router();

router.get('/', (req, res, next) => {
    res.render('cart', { title: 'Cart' });
});

// verify user session before every post-cart route
router.use(authMiddleware.verifyUserSession);

router.post('/quantity', cartController.getQuantityOfProducts);
router.post('/menu', cartController.getAllProductsForCartMenu);
router.post('/all', cartController.getAllProducts);
router.post('/add', cartController.addProduct);
router.post('/remove', cartController.removeProduct);
router.post('/update-product', cartController.updateProductInCart);

module.exports = router;
