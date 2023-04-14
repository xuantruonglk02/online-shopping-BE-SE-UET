const express = require('express');

const userController = require('../../controllers/user.controller');

const router = express.Router();

router.get('/account', userController.getUserInformation);
router.put('/setting/change-name', userController.changeName);
router.put('/setting/change-email', userController.changeEmail);
router.put('/setting/change-phone', userController.changePhone);
router.put('/setting/change-address', userController.changeAddress);
router.put('/setting/change-password', userController.changePassword);

module.exports = router;
