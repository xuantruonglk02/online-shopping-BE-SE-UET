const express = require('express');

const authController = require('../../controllers/auth.controller');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup/register-email', authController.registerEmail);
router.post('/signup/create-account', authController.createAccount);
router.post('/forget-password', authController.forgetPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
