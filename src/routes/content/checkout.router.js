const express = require('express');
const createError = require('http-errors');

const authMiddleware = require('../../middlewares/auth.middleware');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.get('/', authMiddleware.verifyTokenGET, (req, res, next) => {
    userController.getUserInformationForCheckout(req, (err, user) => {
        if (err) {
            return next(createError(err));
        }
        res.render('checkout', {
            title: 'Thanh toán',
            userName: user.name,
            userPhone: user.phone,
            userAddress: user.address,
        });
    });
});

module.exports = router;
