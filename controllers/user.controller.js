const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { connection } = require('../models/database');

function getUserId(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
}

function getCartId(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.cartId;
}

function getUserInformation(req, res) {
  const userId = getUserId(req.headers['x-access-token']);

  connection.query('SELECT name, phone, email, address FROM Users WHERE user_id=?', [userId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json(results[0]);
  });
}

/**
 * name : body
 * password : body
 */
function changeName(req, res) {
  if (!req.body.name || !req.body.password) {
    return res.json({ success: 0 });
  }

  const userId = getUserId(req.headers['x-access-token']);

  connection.query('SELECT password FROM Users WHERE user_id=?', [userId], async (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    const match = await bcrypt.compare(req.body.password, results[0].password);
    if (!match) {
      return res.json({ success: 0, msg: 'Mật khẩu không chính xác' });
    }

    connection.query('UPDATE Users SET name=? WHERE user_id=?', [req.body.name, userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
  
      res.json({ success: 1 });
    });
  });
}

/**
 * email : body
 * password : body
 */
function changeEmail(req, res) {
  if (!req.body.email || !req.body.password) {
    return res.json({ success: 0 });
  }
  if (!validator.isEmail(req.body.email)) {
    return res.json({ success: 0, msg: 'Email không hợp lệ' });
  }

  const userId = getUserId(req.headers['x-access-token']);

  connection.query('SELECT password FROM Users WHERE user_id=?', [userId], async (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    const match = await bcrypt.compare(req.body.password, results[0].password);
    if (!match) {
      return res.json({ success: 0, msg: 'Mật khẩu không chính xác' });
    }

    connection.query('SELECT COUNT(user_id) AS exist FROM Users WHERE email=?', [req.body.email], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
  
      if (results[0].exist) {
        return res.json({ success: 0, msg: 'Email đã tồn tại' });
      }

      connection.query('UPDATE Users SET email=? WHERE user_id=?', [req.body.email, userId], (err, results) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }
    
        res.json({ success: 1 });
      });
    });
  });
}

/**
 * phone : body
 * password : body
 */
function changePhone(req, res) {
  if (!req.body.phone || !req.body.password) {
    return res.json({ success: 0 });
  }
  if (!validator.isMobilePhone(req.body.phone, 'vi-VN')) {
    return res.json({ success: 0, msg: 'Số điện thoại không hợp lệ' });
  }

  const userId = getUserId(req.headers['x-access-token']);

  connection.query('SELECT password FROM Users WHERE user_id=?', [userId], async (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    const match = await bcrypt.compare(req.body.password, results[0].password);
    if (!match) {
      return res.json({ success: 0, msg: 'Mật khẩu không chính xác' });
    }

    connection.query('SELECT COUNT(user_id) AS exist FROM Users WHERE phone=?', [req.body.phone], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
  
      if (results[0].exist) {
        return res.json({ success: 0, msg: 'Số điện thoại đã tồn tại' });
      }

      connection.query('UPDATE Users SET phone=? WHERE user_id=?', [req.body.phone, userId], (err, results) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }
    
        res.json({ success: 1 });
      });
    });
  });
}

/**
 * oldPassword : body
 * newPassword : body
 */
function changePassword(req, res) {
  if (!req.body.oldPassword || !req.body.newPassword) {
    return res.json({ success: 0 });
  }

  const userId = getUserId(req.headers['x-access-token']);
  connection.query('SELECT password FROM Users WHERE user_id=?', [userId], async (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    const matchOldPassword = await bcrypt.compare(req.body.oldPassword, results[0].password);
    if (!matchOldPassword) {
      return res.json({ success: 0, msg: 'Mật khẩu không chính xác' });
    }
    const matchNewPassword = await bcrypt.compare(req.body.newPassword, results[0].password);
    if (matchNewPassword) {
      return res.json({ success: 0, msg: 'Mật khẩu mới không được giống mật khẩu hiện tại' });
    }

    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(req.body.newPassword, salt);

    connection.query('UPDATE Users SET password=? WHERE user_id=?', [hash, userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
  
      res.json({ success: 1 });
    });
  });
}

/**
 * address : body
 * password : body
 */
function updateAddress(req, res) {
  if (!req.body.address || !req.body.password) {
    return res.json({ success: 0 });
  }

  const userId = getUserId(req.headers['x-access-token']);

  connection.query('SELECT password FROM Users WHERE user_id=?', [userId], async (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    const match = await bcrypt.compare(req.body.password, results[0].password);
    if (!match) {
      return res.json({ success: 0, msg: 'Mật khẩu không chính xác' });
    }

    connection.query('UPDATE Users SET address=? WHERE user_id=?', [req.body.address, userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
  
      res.json({ success: 1 });
    });
  });
}

module.exports = {
  getUserId,
  getCartId,
  getUserInformation,
  changeName,
  changeEmail,
  changePhone,
  changePassword,
  updateAddress
}
