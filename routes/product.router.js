const express = require('express');

const productController = require('../controllers/product.controller');

const router = express.Router();

router.get('/:id', (req, res) => {
  res.end('product ' + req.params.id);
});
router.post('/:id', productController.getProductById);
router.post('/line/:lineId', productController.getProductsByLine);
router.post('/class/:classId', productController.getProductsByClass);
router.post('/new', productController.getNewProducts);

module.exports = router;
