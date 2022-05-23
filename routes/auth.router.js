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

router.post('/login', authController.login);
router.post('/signup/register-email', authController.registerEmail);
router.post('/signup/create-account', authController.createAccount);

module.exports = router;
