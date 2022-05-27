const { connection, commitTransaction } = require('../models/database');
const { getUserId } = require('../controllers/user.controller');

/**
 * userName : body
 * userPhone : body
 * userAddress : body
 * list: [{productId,sizeId,quantity}] : body
 */
function checkout(req, res) {
  if (!req.body.userName || !req.body.userPhone || !req.body.userAddress) {
    return res.json({ success: 0, code: 'not-infor' });
  }
  if (!req.body.list) { return res.json({ success: 0 }); }
  try {
    req.body.list = JSON.parse(req.body.list);
  } catch (err) {
    console.log(err);
    return res.json({ success: 0 });
  }
  if (!req.body.list.length) { return res.json({ success: 0 }); }
  for (let i = 0; i < req.body.list.length; i++) {
    if (!req.body.list[i].productId || !req.body.list[i].sizeId || isNaN(req.body.list[i].quantity)) {
      return res.json({ success: 0 });
    }
    req.body.list[i].quantity = parseInt(req.body.list[i].quantity);
    if (req.body.list[i].quantity < 1) { return res.json({ success: 0 }); }
  }

  connection.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    let query = 'SELECT product_id, size_id FROM Product_has_Size WHERE'
      + ' (product_id=? AND size_id=? AND quantity<?) OR'.repeat(req.body.list.length).slice(0, -3);
    let params = req.body.list.reduce((p, c) => p.concat([c.productId, c.sizeId, c.quantity]), []);
    connection.query(query, params, (err, results) => {
      if (err) {
        console.log(err);
        return connection.rollback(() => { return res.json({ success: 0 }); });
      }
      if (results.length > 0) {
        return connection.rollback(() => { return res.json({ success: 0, code: 'not-enough', list: results }); });
      }
    
      const userId = getUserId(req.cookies['x-access-token']);
      const billId = new Date().getTime();
      connection.query('INSERT INTO Bills (bill_id, user_id, user_name, user_phone, user_address) VALUES (?,?,?,?,?)',
        [billId, userId, req.body.userName, req.body.userPhone, req.body.userAddress], (err, results) => {
          if (err) {
            console.log(err);
            return connection.rollback(() => { return res.json({ success: 0 }); });
          }

          let query = 'INSERT INTO Bill_has_Product (bill_id, product_id, size_id, quantity) VALUES'
            + ' (?,?,?,?),'.repeat(req.body.list.length).slice(0, -1);
          let params = req.body.list.reduce((p, c) => p.concat([billId, c.productId, c.sizeId, c.quantity]), []);
          connection.query(query, params, (err, results) => {
            if (err) {
              console.log(err);
              return connection.rollback(() => { return res.json({ success: 0 }); });
            }

            commitTransaction(connection, res);
          });
        });
    });
  });
}

module.exports = {
  checkout
}
