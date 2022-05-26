const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

router.get('/', authMiddleware.verifyTokenGET, (req, res) => {
  res.render('cart', { title: 'Cart' });
});

router.post('/quantity', authMiddleware.verifyTokenPOST, cartController.getQuantityOfProducts);
router.post('/menu', authMiddleware.verifyTokenPOST, cartController.getAllProductsForCartMenu);
router.post('/all', authMiddleware.verifyTokenPOST, cartController.getAllProducts);
router.post('/add', authMiddleware.verifyTokenPOST, cartController.addProduct);
router.post('/update', authMiddleware.verifyTokenPOST, cartController.updateCart);
router.post('/remove', authMiddleware.verifyTokenPOST, cartController.removeProduct);
router.post('/remove-more', authMiddleware.verifyTokenPOST, cartController.removeProducts);

module.exports = router;
