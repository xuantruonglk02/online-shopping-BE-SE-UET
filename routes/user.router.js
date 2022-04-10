const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

// router.post('/', authMiddleware.verifyToken, userController.getInfor);
router.post('/name', authMiddleware.verifyToken, userController.changeName);
router.post('/email', authMiddleware.verifyToken, userController.changeEmail);
router.post('/number', authMiddleware.verifyToken, userController.changeNumber);
router.post('/password', authMiddleware.verifyToken, userController.changePassword);
router.post('/address', authMiddleware.verifyToken, userController.updateAddress);

module.exports = router;
