const express = require('express');

const connection = require('../models/database');

const router = express.Router();

router.get('/login', (req, res) => {
  res.end('login');
});

router.get('/signup', (req, res) => {
  res.end('signup');
});

router.post('/login', (req, res) => {
  res.json(req.body);
});

router.post('/signup', (req, res) => {
  res.json(req.body);
});

module.exports = router;
