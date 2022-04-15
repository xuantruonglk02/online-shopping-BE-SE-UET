const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

router.get('/:productId', authMiddleware.verifyToken, (req, res) => {
  res.end('checkout for a product');
});
router.post('/:productId', authMiddleware.verifyToken, checkoutController.checkoutForAProduct);
router.get('/', authMiddleware.verifyToken, (req, res) => {
  res.end('checkout for cart');
});

module.exports = router;
