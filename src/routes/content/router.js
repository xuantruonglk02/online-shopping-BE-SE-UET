const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');

const homeRouter = require('./home.router');
const authRouter = require('./auth.router');
const userRouter = require('./user.router');
const cartRouter = require('./cart.router');
const productRouter = require('./product.router');
const checkoutRouter = require('./checkout.router');
const adminRouter = require('./admin.router');

const router = express.Router();

router.use('/', homeRouter);
router.use('/auth', authRouter);
router.use('/user', authMiddleware.verifyTokenGET, userRouter);
router.use('/cart', authMiddleware.verifyTokenGET, cartRouter);
router.use('/product', productRouter);
router.use('/checkout', authMiddleware.verifyTokenGET, checkoutRouter);
router.use(
    '/admin',
    authMiddleware.verifyTokenGET,
    authMiddleware.isAdmin,
    adminRouter
);

module.exports = router;
