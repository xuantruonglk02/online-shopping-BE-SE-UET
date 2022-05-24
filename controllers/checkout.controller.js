const { connection } = require('../models/database');
const { getUserId } = require('../controllers/user.controller');

/**
 * productId : params
 * sizeId : body
 * quantity : body
 */
function checkoutForAProduct(req, res) {
  if (!req.body.sizeId || !req.body.quantity) {
    return res.json({ success: 0 });
  }
  try {
    req.body.quantity = parseInt(req.body.quantity);
  } catch (err) {
    console.log(err);
    return res.json({ success: 0 });
  }
  if (req.body.quantity < 1) { return res.json({ success: 0 }); }

  connection.query('SELECT quantity FROM Product_has_Size WHERE product_id=? AND size_id=?',
    [req.params.productId, req.body.sizeId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (!results.length) {
        return res.json({ success: 0 });
      }
      if (results[0].quantity <= 0 || results[0].quantity < req.body.quantity) {
        return res.json({ success: 0, msg: 'Hàng trong kho không đủ' });
      }

      const userId = getUserId(req.headers['x-access-token']);
      connection.query('SELECT name, phone, address FROM Users WHERE user_id=?', [userId], (err, results) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }

        if (!results.length) {
          return res.json({ success: 0 });
        }

        const userName = results[0].name, userNumber = results[0].phone, userAddress = results[0].address;
        connection.query('INSERT INTO Bills (user_id, user_name, user_phone, user_address) VALUES (?,?,?,?)',
          [userId, userName, userNumber, userAddress], (err, results) => {
            if (err) {
              console.log(err);
              return res.json({ success: 0 });
            }
      
            const billId = results.insertId;
            connection.query('INSERT INTO Bill_has_Product (bill_id, product_id, size_id, quantity) VALUES (?,?,?,?)',
              [billId, req.params.productId, req.body.sizeId, req.body.quantity], (err, results) => {
                if (err) {
                  console.log(err);
                  return res.json({ success: 0 });
                }
      
                res.json({ success: 1 });
              });
          });
      });
    });
}

/**
 * list: [{productId,sizeId,quantity}] : body
 */
function checkoutForCart(req, res) {
  if (!req.body.list) {
    return res.json({ success: 0 });
  }
  try {
    req.body.list = JSON.parse(req.body.list);
  } catch (err) {
    console.log(err);
    return res.json({ success: 0 });
  }
  if (!req.body.list.length) {
    return res.json({ success: 0 });
  }
  for (let i = 0; i < req.body.list.length; i++) {
    if (!req.body.list[i].productId || !req.body.list[i].sizeId || isNaN(req.body.list[i].quantity)) {
      return res.json({ success: 0 });
    }
    req.body.list[i].quantity = parseInt(req.body.list[i].quantity);
    if (req.body.list[i].quantity < 1) { return res.json({ success: 0 }); }
  }
  
  let query = 'SELECT product_id, size_id FROM Product_has_Size WHERE'
    + ' (product_id=? AND size_id=? AND quantity<?) OR'.repeat(req.body.list.length).slice(0, -3);
  let params = req.body.list.reduce((p, c) => p.concat([c.productId, c.sizeId, c.quantity]), []);
  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }
    
    if (results.length > 0) {
      return res.json({ success: 0, msg: 'Hàng trong kho không đủ', list: results });
    }
    
    const userId = getUserId(req.headers['x-access-token']);
    connection.query('SELECT name, phone, address FROM Users WHERE user_id=?', [userId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (!results.length) {
        return res.json({ success: 0 });
      }

      const userName = results[0].name, userNumber = results[0].phone, userAddress = results[0].address;
      connection.query('INSERT INTO Bills (user_id, user_name, user_phone, user_address) VALUES (?,?,?,?)',
        [userId, userName, userNumber, userAddress], (err, results) => {
          if (err) {
            console.log(err);
            return res.json({ success: 0 });
          }

          const billId = results.insertId;
          let query = 'INSERT INTO Bill_has_Product (bill_id, product_id, size_id, quantity) VALUES'
            + ' (?,?,?,?),'.repeat(req.body.list.length).slice(0, -1);
          let params = req.body.list.reduce((p, c) => p.concat([billId, c.productId, c.sizeId, c.quantity]), []);
          connection.query(query, params, (err, results) => {
            if (err) {
              console.log(err);
              return res.json({ success: 0 });
            }

            res.json({ success: 1 });
          });
        });
    });
  });
}

module.exports = {
  checkoutForAProduct,
  checkoutForCart
}
