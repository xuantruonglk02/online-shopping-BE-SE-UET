const express = require('express');
const createError = require('http-errors');

const authMiddleware = require('../middlewares/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/account', authMiddleware.verifyTokenGET, (req, res, next) => {
  userController.getUserInformation(req, (err, user) => {
    if (err) {
      console.log(err);
      return next(createError(500));
    }
    res.render('account', {
      title: 'Thông tin tài khoản',
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address
    });
  });
});
router.get('/orders', authMiddleware.verifyTokenGET, (req, res) => {
  res.render('user-orders', { title: 'Thông tin đơn hàng' });
});

router.post('/account', authMiddleware.verifyTokenPOST, userController.getUserInformation);
router.post('/setting/change-name', authMiddleware.verifyTokenPOST, userController.changeName);
router.post('/setting/change-email', authMiddleware.verifyTokenPOST, userController.changeEmail);
router.post('/setting/change-phone', authMiddleware.verifyTokenPOST, userController.changePhone);
router.post('/setting/change-address', authMiddleware.verifyTokenPOST, userController.changeAddress);
router.post('/setting/change-password', authMiddleware.verifyTokenPOST, userController.changePassword);

module.exports = router;
