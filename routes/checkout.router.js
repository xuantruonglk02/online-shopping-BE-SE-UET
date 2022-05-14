const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

router.get('/:productId', authMiddleware.verifyTokenGET, (req, res) => {
  res.end('checkout for a product');
});
router.get('/', authMiddleware.verifyTokenGET, (req, res) => {
  res.end('checkout for cart');
});

router.post('/:productId', authMiddleware.verifyTokenPOST, checkoutController.checkoutForAProduct);
router.post('/', authMiddleware.verifyTokenPOST, checkoutController.checkoutForCart);

module.exports = router;
