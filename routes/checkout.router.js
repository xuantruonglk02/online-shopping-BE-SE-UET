const express = require('express');
const createError = require('http-errors');

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');
const productController = require('../controllers/product.controller');
const checkoutController = require('../controllers/checkout.controller');

const router = express.Router();

router.get('/:productId', authMiddleware.verifyTokenGET, (req, res, next) => {
  userController.getUserInformationForCheckout(req, (err, user) => {
    if (err) {
      console.log(err);
      return next(createError(500));
    }
    productController.getProductByIdForCheckout(req.params.productId, (err, product) => {
      if (err) {
        console.log(err);
        return next(createError(500));
      }
      res.render('checkout-single', {
        title: product.name + ' - Thanh toán',
        userName: user.name,
        userPhone: user.phone,
        userAddress: user.address,
        productId: req.params.productId,
        productName: product.name,
        productPrice: product.price,
        productThumb: product.thumbnail,
        sizeId: req.query.sizeId,
        size: req.query.size,
        quantity: req.query.quantity
      });
    });
  });
});
router.get('/', authMiddleware.verifyTokenGET, (req, res) => {
  res.render('checkout-cart', {});
});

router.post('/:productId', authMiddleware.verifyTokenPOST, checkoutController.checkoutForAProduct);
router.post('/', authMiddleware.verifyTokenPOST, checkoutController.checkoutForCart);

module.exports = router;
