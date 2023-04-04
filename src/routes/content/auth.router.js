const express = require('express');

const router = express.Router();

router.get('/login', (req, res, next) => {
    res.render('login', { title: 'Login' });
});
router.get('/signup/register-email', (req, res, next) => {
    res.render('signup-email', { title: 'Đăng ký email' });
});
router.get('/signup/create-account', (req, res, next) => {
    res.render('signup-account', { title: 'Tạo tài khoản' });
});
router.get('/logout', (req, res, next) => {
    res.clearCookie('x-access-token');
    res.redirect('/');
});
router.get('/forget-password', (req, res, next) => {
    res.render('auth-forget', { title: 'Quên mật khẩu' });
});
router.get('/reset-password', (req, res, next) => {
    res.render('auth-reset', { title: 'Đặt lại mật khẩu' });
});

module.exports = router;
