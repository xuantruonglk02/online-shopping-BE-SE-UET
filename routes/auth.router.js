const express = require('express');

const authController = require('../controllers/auth.controller');

const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login');
});
router.get('/signup', (req, res) => {
  res.render('signup');
});
router.post('/login', authController.loginPost);
router.post('/signup', authController.signupPost);

module.exports = router;
