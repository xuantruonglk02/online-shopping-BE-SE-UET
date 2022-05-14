const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.get('/', authMiddleware.verifyTokenGET, authMiddleware.isAdmin, (req, res) => {
  res.end('admin');
});

router.post('/add-product', authMiddleware.verifyTokenPOST, authMiddleware.isAdmin, adminController.addProduct);
router.post('/modify-product', authMiddleware.verifyTokenPOST, authMiddleware.isAdmin, adminController.modifyProduct);
router.post('/remove-product', authMiddleware.verifyTokenPOST, authMiddleware.isAdmin, adminController.removeProduct);
router.post('/get-all-bills', authMiddleware.verifyTokenPOST, authMiddleware.isAdmin, adminController.getBills);

module.exports = router;
