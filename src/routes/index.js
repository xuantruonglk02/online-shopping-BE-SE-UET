const express = require('express');

const apiRouter = require('./api/router');
const contentRouter = require('./content/router');

const router = express.Router();

router.use('/api', apiRouter);
router.use('/', contentRouter);

module.exports = router;
