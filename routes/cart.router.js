const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, (req, res) => {
  res.render('cart', { title: 'Cart' });
});

router.post('/all', authMiddleware.verifyToken, cartController.getAllProductsInCart);
router.post('/add', authMiddleware.verifyToken, cartController.addProduct);
router.post('/update', authMiddleware.verifyToken, cartController.updateCart);
router.post('/remove', authMiddleware.verifyToken, cartController.removeProduct);

module.exports = router;
