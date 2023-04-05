const express = require('express');
const createError = require('http-errors');

const authMiddleware = require('../../middlewares/auth.middleware');
const userController = require('../../controllers/user.controller');

const router = express.Router();

router.get('/account', authMiddleware.verifyTokenGET, (req, res, next) => {
    userController.getUserInformation(req, (err, user) => {
        if (err) {
            return next(createError(err));
        }
        res.render('account', {
            title: 'Thông tin tài khoản',
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
        });
    });
});
router.get('/orders', authMiddleware.verifyTokenGET, (req, res, next) => {
    res.render('user-orders', { title: 'Thông tin đơn hàng' });
});

module.exports = router;
