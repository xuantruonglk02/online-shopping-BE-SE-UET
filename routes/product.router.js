const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.post('/new', productController.getNewProducts);
router.post('/line/:lineId', productController.getAllProductsByLine);
router.post('/class/:classId', productController.getAllProductsByClass);
router.post('/category/class/all', productController.getAllProductClasses);
router.post('/category/line/all', productController.getAllProductLines);
router.post('/category/class/:classId', productController.getAllProductLinesByClass);
router.post('/search', productController.searchProductsByKeyword);
router.post('/:productId/rating', productController.getAllRatingsOfProduct);
router.post('/:productId/rate', authMiddleware.verifyToken, productController.insertUserRating);
router.get('/:productId', (req, res) => {
  res.end('product ' + req.params.productId);
});
router.post('/:productId', productController.getProductById);

module.exports = router;
