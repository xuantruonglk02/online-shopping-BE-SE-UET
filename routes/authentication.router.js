const express = require('express');
const bcrypt = require('bcrypt');
const validator = require('validator');

const connection = require('../models/database');

const router = express.Router();

router.get('/login', (req, res) => {
  console.log(req.flash('errors'));
  res.sendFile(__dirname.replace('routes', 'views\\login.html'));
});

router.get('/signup', (req, res) => {
  console.log(req.flash('errors'));
  res.sendFile(__dirname.replace('routes', 'views\\signup.html'));
});

/**
 * field 'username', 'password'
 */
router.post('/login', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    return res.redirect('/auth/login');
  }
  connection.query('SELECT password FROM user WHERE ? IN(number, email)',
    [req.body.username],
    async (err, results, fields) => {
      if (err) { return console.log(err); }
      if (!results.length) {
        req.flash('errors', { msg: 'Số điện thoại hoặc email không đúng' });
        return res.redirect('/auth/login');
      }
      const match = await bcrypt.compare(req.body.password, results[0].password);
      if (match) {
        res.json(results);
      } else {
        req.flash('errors', { msg: 'Mật khẩu không đúng' });
        return res.redirect('/auth/login');
      }
    });
});

/**
 * field 'name', 'email', 'number', 'password'
 */
router.post('/signup', (req, res) => {
  if (!req.body.name || !req.body.number || !req.body.password) {
    return res.redirect('/auth/signup');
  }
  if ((req.body.email && !validator.isEmail(req.body.email))) {
    req.flash('errors', { msg: 'Email không hợp lệ' });
    return res.redirect('/auth/signup');
  }
  if (!validator.isMobilePhone(req.body.number, 'vi-VN')) {
    req.flash('errors', { msg: 'Số điện thoại không hợp lệ' });
    return res.redirect('/auth/signup');
  }
  connection.query('SELECT COUNT(*) AS exist FROM user WHERE email=? OR number=?',
    [req.body.email, req.body.number],
    async (err, results, fields) => {
      if (err) { return console.log(err); }
      if (results[0].exist) {
        req.flash('errors', { msg: 'Email hoặc số điện thoại đã được đăng ký' });
        return res.redirect('/auth/signup');
      }
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(req.body.password, salt);
      connection.query('INSERT INTO cart VALUES(DEFAULT, DEFAULT)', (err, results, fields) => {
        if (err) {
          console.log(err);
          req.flash('errors', { msg: 'Đã có lỗi xảy ra' });
          return res.redirect('/auth/signup');
        }
        const cartId = results.insertId;
        connection.query('INSERT INTO user(cart_id, name, number, email, password) VALUES(?, ?, ?, ?, ?)',
          [cartId, req.body.name, req.body.number, req.body.email, hash],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              req.flash('errors', { msg: 'Đã có lỗi xảy ra' });
              return res.redirect('/auth/signup');    
            }
            res.redirect('/');
          });
      });
  });
});

module.exports = router;
