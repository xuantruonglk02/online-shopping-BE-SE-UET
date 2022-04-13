const express = require('express');

const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.end('product ' + req.params.id);
});
router.post('/:id', productController.getProductById);
router.post('/new', productController.getNewProducts);
router.post('/line/:lineId', productController.getAllProductsByLine);
router.post('/class/:classId', productController.getAllProductsByClass);
router.post('/category/class/all', productController.getAllProductClasses);
router.post('/category/line/all', productController.getAllProductLines);
router.post('/category/class/:classId', productController.getAllProductLinesByClass);

module.exports = router;
