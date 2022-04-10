const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const connection = require('../models/database');

/**
 * username : body
 * password : body
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
        return res.json({ success: 0, msg: 'Số điện thoại hoặc email không chính xác' });
      }
      
      const match = await bcrypt.compare(req.body.password, results[0].password);
      if (!match) {
        return res.json({ success: 0, msg: 'Mật khẩu không chính xác' });
      }
      
      const token = jwt.sign({ userId: results[0].id, cartId: results[0].cart_id }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24
      });
      res.json({ success: 1, accessToken: token });
    });
}

/**
 * name : body
 * email : body
 * number : body
 * password : body
 */
function signupPost(req, res) {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.json({ success: 0 });
  }
  if (!validator.isEmail(req.body.email)) {
    return res.json({ success: 0, msg: 'Email không hợp lệ' });
  }
  if (req.body.number && !validator.isMobilePhone(req.body.number, 'vi-VN')) {
    return res.json({ success: 0, msg: 'Số điện thoại không hợp lệ' });
  }

  connection.query('SELECT COUNT(id) AS exist FROM user WHERE email=? OR number=?',
    [req.body.email, req.body.number],
    async (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (results[0].exist) {
        return res.json({ success: 0, msg: 'Email hoặc số điện thoại đã tồn tại' });
      }

      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(req.body.password, salt);

      connection.query('INSERT INTO cart VALUES(DEFAULT, DEFAULT)', (err, results, fields) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }

        const cartId = results.insertId;

        connection.query('INSERT INTO user(cart_id, name, number, email, password) VALUES (?,?,?,?,?)',
          [cartId, req.body.name, req.body.number, req.body.email, hash],
          (err, results, fields) => {
            if (err) {
              console.log(err);
              return res.json({ success: 0 });
            }
            
            const token = jwt.sign({ userId: results.insertId, cartId: cartId }, process.env.JWT_SECRET, {
              expiresIn: 60 * 60 * 24
            });
            res.json({ success: 1, accessToken: token });
          });
      });
    });
}

module.exports = {
  loginPost,
  signupPost
}
