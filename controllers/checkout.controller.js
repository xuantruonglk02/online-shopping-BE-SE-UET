const connection = require('../models/database');
const userController = require('../controllers/user.controller');

/**
 * productId : params
 * amount : body
 */
function checkoutForAProduct(req, res) {
  if (!req.body.amount || isNaN(req.body.amount)) {
    return res.json({ success: 0 });
  }

  req.body.amount = parseInt(req.body.amount);

  connection.query('SELECT amount FROM product WHERE id=?', [req.params.productId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    if (!results.length) {
      return res.json({ success: 0 });
    }
    if (results[0].amount <= 0 || results[0].amount < req.body.amount) {
      return res.json({ success: 0, msg: 'Hàng trong kho không đủ' });
    }

    const userId = userController.getUserId(req.headers['x-access-token']);
    connection.query('INSERT INTO bill (user_id) VALUES (?)', [userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      const billId = results.insertId;
      connection.query('INSERT INTO bill_has_product (bill_id, product_id, amount) VALUES (?,?,?)',
        [billId, req.params.productId, req.body.amount], (err, results) => {
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
 * list: [{productId:amount}] : body
 */
function checkoutForCart(req, res) {
  if (!req.body.list) {
    return res.json({ success: 0 });
  }

  try {
    req.body.list = JSON.parse(req.body.list);
  } catch (err) {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }
  }
  if (!req.body.list.length) {
    return res.json({ success: 0 });
  }

  for (let i = 0; i < req.body.list.length; i++) {
    if (isNaN(req.body.list[i].productId) || req.body.list[i].productId < 1
    || isNaN(req.body.list[i].amount) || req.body.list[i].amount < 1) {
      return res.json({ success: 0 });
    }

    req.body.list[i].productId = parseInt(req.body.list[i].productId);
    req.body.list[i].amount = parseInt(req.body.list[i].amount);
  }

  let query = 'SELECT id FROM product WHERE' + ' (id=? AND amount<?) OR'.repeat(req.body.list.length);
  query = query.slice(0, -3);
  let params = req.body.list.reduce((p, c) => p.concat([c.productId, c.amount]), []);

  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }
    
    if (results.length) {
      return res.json({ success: 0, msg: 'Hàng trong kho không đủ', list: results });
    }
    
    const userId = userController.getUserId(req.headers['x-access-token']);
    connection.query('INSERT INTO bill (user_id) VALUES (?)', [userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      const billId = results.insertId;
      let query = 'INSERT INTO bill_has_product (bill_id, product_id, amount) VALUES';
      query += ' (?,?,?),'.repeat(req.body.list.length).slice(0, -1);
      let params = req.body.list.reduce((p, c) => p.concat([billId, c.productId, c.amount]), []);
      connection.query(query, params, (err, results) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }

        res.json({ success: 1 });
      });
    });
  });
}

module.exports = {
  checkoutForAProduct,
  checkoutForCart
}
