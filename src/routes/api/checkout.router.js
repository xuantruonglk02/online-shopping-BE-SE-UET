const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const checkoutController = require('../../controllers/checkout.controller');

const router = express.Router();

router.post('/', checkoutController.checkout);

module.exports = router;
