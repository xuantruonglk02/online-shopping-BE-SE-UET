const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res) => {
  res.end('admin');
});
router.post('/add-product', adminController.addProduct);
router.post('/modify-product', adminController.modifyProduct);
router.post('/remove-product', adminController.removeProduct);
router.post('/get-all-bills', adminController.getBills);

module.exports = router;
