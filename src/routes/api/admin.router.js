const express = require('express');

const adminController = require('../../controllers/admin.controller');

const router = express.Router();

router.post('/add-product', adminController.addProduct);
router.post('/modify-product', adminController.modifyProduct);
router.post('/remove-product', adminController.removeProduct);
router.post('/get-all-bills', adminController.getBills);

module.exports = router;
