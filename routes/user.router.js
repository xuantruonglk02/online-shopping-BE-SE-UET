const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post('/account', authMiddleware.verifyToken, userController.getUserInformation);
router.post('/setting/change-name', authMiddleware.verifyToken, userController.changeName);
router.post('/setting/change-email', authMiddleware.verifyToken, userController.changeEmail);
router.post('/setting/change-number', authMiddleware.verifyToken, userController.changeNumber);
router.post('/setting/update-address', authMiddleware.verifyToken, userController.updateAddress);
router.post('/setting/change-password', authMiddleware.verifyToken, userController.changePassword);

module.exports = router;
