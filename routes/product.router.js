const express = require('express');
const createError = require('http-errors');

const authMiddleware = require('../middlewares/auth.middleware');
const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/:productId', (req, res, next) => {
  productController.getProductById(req.params.productId, (err, result) => {
    if (err) {
      console.log(err);
      return next(createError(500));
    }

    result.price = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'VND' }).format(result.price);
    res.render('product', {
      title: result.name,
      product: result
    });
  });
});

router.post('/new', productController.getNewProducts);
router.post('/line/:lineId', productController.getAllProductsByLine);
router.post('/class/:classId', productController.getAllProductsByClass);
router.post('/category/class/all', productController.getAllProductClasses);
router.post('/category/line/all', productController.getAllProductLines);
router.post('/category/class/:classId', productController.getAllProductLinesByClass);
router.post('/search', productController.searchProductsByKeyword);
router.post('/:productId/rating', productController.getAllRatingsOfProduct);
router.post('/:productId/rate', authMiddleware.verifyToken, productController.insertUserRating);

module.exports = router;
