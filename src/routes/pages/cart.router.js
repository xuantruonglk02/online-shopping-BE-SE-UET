const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware.verifyTokenGET, (req, res, next) => {
    res.render('cart', { title: 'Cart' });
});

module.exports = router;
