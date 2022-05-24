const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/account', authMiddleware.verifyTokenGET, (req, res) => {
  res.render('account', { title: 'Account' });
});

router.post('/account', authMiddleware.verifyTokenPOST, userController.getUserInformation);
router.post('/setting/change-name', authMiddleware.verifyTokenPOST, userController.changeName);
router.post('/setting/change-email', authMiddleware.verifyTokenPOST, userController.changeEmail);
router.post('/setting/change-phone', authMiddleware.verifyTokenPOST, userController.changePhone);
router.post('/setting/update-address', authMiddleware.verifyTokenPOST, userController.updateAddress);
router.post('/setting/change-password', authMiddleware.verifyTokenPOST, userController.changePassword);

module.exports = router;
