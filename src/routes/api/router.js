const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');

const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const cartRouter = require('./cart.router');
const productRouter = require('./product.router');
const checkoutRouter = require('./checkout.router');
const adminRouter = require('./admin.router');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', authMiddleware.verifyTokenPOST, userRouter);
router.use('/cart', authMiddleware.verifyTokenPOST, cartRouter);
router.use('/product', productRouter);
router.use('/checkout', authMiddleware.verifyTokenPOST, checkoutRouter);
router.use(
    '/admin',
    authMiddleware.verifyTokenPOST,
    authMiddleware.isAdmin,
    adminRouter
);

module.exports = router;
