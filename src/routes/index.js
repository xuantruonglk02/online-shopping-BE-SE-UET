const express = require('express');

const apiRouter = require('./api/router');
const pagesRouter = require('./pages/router');

const router = express.Router();

router.use('/api', apiRouter);
router.use('/', pagesRouter);

module.exports = router;
