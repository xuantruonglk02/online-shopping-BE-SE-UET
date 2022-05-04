const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

router.get('/:productId', authMiddleware.verifyToken, (req, res) => {
  res.end('checkout for a product');
});
router.get('/', authMiddleware.verifyToken, (req, res) => {
  res.end('checkout for cart');
});

router.post('/:productId', authMiddleware.verifyToken, checkoutController.checkoutForAProduct);
router.post('/', authMiddleware.verifyToken, checkoutController.checkoutForCart);

module.exports = router;
