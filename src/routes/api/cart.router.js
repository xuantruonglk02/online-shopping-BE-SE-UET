const express = require('express');

const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.post('/quantity', cartController.getQuantityOfProducts);
router.post('/menu', cartController.getAllProductsForCartMenu);
router.post('/all', cartController.getAllProducts);
router.post('/add', cartController.addProduct);
router.post('/update', cartController.updateProductInCart);
router.post('/remove', cartController.removeProduct);
router.post('/remove-more', cartController.removeProduct);

module.exports = router;