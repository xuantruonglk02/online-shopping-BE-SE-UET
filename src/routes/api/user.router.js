const express = require('express');

const userController = require('../../controllers/user.controller');

const router = express.Router();

router.post('/account', userController.getUserInformation);
router.post('/setting/change-name', userController.changeName);
router.post('/setting/change-email', userController.changeEmail);
router.post('/setting/change-phone', userController.changePhone);
router.post('/setting/change-address', userController.changeAddress);
router.post('/setting/change-password', userController.changePassword);

module.exports = router;
