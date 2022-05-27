const express = require('express');

const authController = require('../controllers/auth.controller');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});
router.get('/signup/register-email', (req, res) => {
  res.render('signup-email', { title: 'Đăng ký email' });
});
router.get('/signup/create-account', (req, res) => {
  res.render('signup-account', { title: 'Tạo tài khoản' });
});
router.get('/logout', (req, res) => {
  res.clearCookie('x-access-token');
  res.redirect('/');
});
router.get('/forget-password', (req, res) => {
  res.render('auth-forget', { title: 'Quên mật khẩu' });
});
router.get('/reset-password', (req, res) => {
  res.render('auth-reset', { title: 'Đặt lại mật khẩu' });
});

router.post('/login', authController.login);
router.post('/signup/register-email', authController.registerEmail);
router.post('/signup/create-account', authController.createAccount);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
