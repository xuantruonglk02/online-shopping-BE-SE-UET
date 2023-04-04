const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');

const router = express.Router();

router.get(
    '/',
    authMiddleware.verifyTokenGET,
    authMiddleware.isAdmin,
    (req, res, next) => {
        res.end('admin');
    }
);

module.exports = router;
