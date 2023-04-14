const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const productController = require('../../controllers/product.controller');

const router = express.Router();

router.get('/new', productController.getNewProducts);
router.get('/category/all', productController.getAllCategories);
router.get('/category/class/all', productController.getAllProductClasses);
router.get('/category/line/all', productController.getAllProductLines);
router.get('/category/class/:classId', productController.getAllProductLinesByClass);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/search', productController.searchProductsByKeyword);
router.get('/checkout-info', productController.getProductsForCheckout);
router.get('/:productId/rating', productController.getAllRatingsOfProduct);
router.post(
    '/:productId/rate',
    authMiddleware.verifyTokenPOST,
    productController.insertUserRating,
);

module.exports = router;
