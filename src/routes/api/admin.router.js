const express = require('express');

const adminController = require('../../controllers/admin.controller');

const router = express.Router();

router.post('/add-product', adminController.addProduct);
router.put('/modify-product', adminController.modifyProduct);
router.delete('/remove-product', adminController.removeProduct);
router.get('/get-all-bills', adminController.getBills);

module.exports = router;
