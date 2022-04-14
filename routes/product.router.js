const express = require('express');

const productController = require('../controllers/product.controller');

const router = express.Router();

router.post('/new', productController.getNewProducts);
router.post('/line/:lineId', productController.getAllProductsByLine);
router.post('/class/:classId', productController.getAllProductsByClass);
router.post('/category/class/all', productController.getAllProductClasses);
router.post('/category/line/all', productController.getAllProductLines);
router.post('/category/class/:classId', productController.getAllProductLinesByClass);
router.post('/search', productController.searchProductsByKeyword);
router.get('/:id', (req, res) => {
  res.end('product ' + req.params.id);
});
router.post('/:id', productController.getProductById);

module.exports = router;
