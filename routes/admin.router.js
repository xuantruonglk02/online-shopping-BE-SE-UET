const express = require('express');

const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware.verifyToken, authMiddleware.isAdmin, (req, res) => {
  res.end('admin');
});

module.exports = router;
