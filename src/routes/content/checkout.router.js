const express = require('express');
const createError = require('http-errors');

const authMiddleware = require('../../middlewares/auth.middleware');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.get('/', authMiddleware.verifyTokenGET, (req, res, next) => {
    res.render('checkout', {
        title: 'Thanh toán',
    });
});

module.exports = router;
