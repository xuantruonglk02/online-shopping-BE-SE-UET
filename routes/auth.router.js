const express = require('express');

const authController = require('../controllers/auth.controller');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});
router.get('/signup', (req, res) => {
  res.render('signup');
});
router.get('/signup/create-account', (req, res) => {
  res.json(req.query);
});

router.post('/login', authController.login);
router.post('/signup/register-email', authController.registerEmail);
router.post('/signup/create-account', authController.createAccount);

module.exports = router;
