const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const connection = require('../models/database');

/**
 * username
 * password
 */
function loginPost(req, res) {
  if (!req.body.username || !req.body.password) {
    return res.json({ success: 0 });
  }

  connection.query('SELECT id, cart_id, password FROM user WHERE ? IN (number, email)',
    [req.body.username],
    async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (!results.length) {
        return res.json({ success: 0 });
      }
      
      const match = await bcrypt.compare(req.body.password, results[0].password);
      if (!match) {
        return res.json({ success: 0 });
      }
      
      const token = jwt.sign({ userId: results[0].id, cartId: results[0].cart_id }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24
      });
      res.status(200).json({ accessToken: token });
      // res.redirect(req.session.returnTo);
    });
}

/**
 * name
 * email
 * number
 * password
 */
function signupPost(req, res) {
  if (!req.body.name || !req.body.number || !req.body.password
    || (req.body.email && !validator.isEmail(req.body.email))
    || !validator.isMobilePhone(req.body.number, 'vi-VN')) {
    return res.json({ success: 0 });
  }

  connection.query('SELECT COUNT(*) AS exist FROM user WHERE email=? OR number=?',
    [req.body.email, req.body.number],
    async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (results[0].exist) {
        return res.json({ success: 0 });
      }

      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(req.body.password, salt);

      connection.query('INSERT INTO cart VALUES(DEFAULT, DEFAULT)', (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }

        const cartId = results.insertId;

        connection.query('INSERT INTO user(cart_id, name, number, email, password) VALUES (?, ?, ?, ?, ?)',
          [cartId, req.body.name, req.body.number, req.body.email, hash],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              return res.json({ success: 0 });
            }
            
            const token = jwt.sign({ userId: results.insertId, cartId: cartId }, process.env.JWT_SECRET, {
              expiresIn: 60 * 60 * 24
            });
            res.status(200).json({ accessToken: token });
            // res.redirect(req.session.returnTo);
          });
      });
    });
}

module.exports = {
  loginPost,
  signupPost
}
