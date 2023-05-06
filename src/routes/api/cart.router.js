const express = require('express');

const cartController = require('../../controllers/cart.controller');

const router = express.Router();

router.get('/quantity', cartController.getQuantityOfProducts);
router.get('/menu', cartController.getAllProductsForCartMenu);
router.get('/all', cartController.getAllProducts);
router.post('/add', cartController.addProduct);
router.put('/update', cartController.updateProductInCart);
router.delete('/remove', cartController.removeProduct);
// router.delete('/remove-more', cartController.removeProduct);

module.exports = router;
