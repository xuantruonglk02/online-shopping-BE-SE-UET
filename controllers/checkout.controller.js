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

  connection.query('SELECT amount FROM product WHERE id=?', [req.params.productId], (err, results, fields) => {
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

    const oldAmount = results[0].amount;
    const userId = userController.getUserId(req.headers['x-access-token']);
    connection.query('INSERT INTO bill (user_id) VALUES (?)', [userId], (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      const billId = results.insertId;
      connection.query('INSERT INTO bill_has_product (bill_id, product_id, amount) VALUES (?,?,?)',
        [billId, req.params.productId, req.body.amount], (err, results, fields) => {
          if (err) {
            console.log(err);
            return res.json({ success: 0 });
          }

          connection.query('UPDATE product SET amount=? WHERE id=?',
            [oldAmount - req.body.amount, req.params.productId], (err, results, fields) => {
              if (err) {
                console.log(err);
              }

              res.json({ success: 1 });
            });
        });
    });
  });
}

module.exports = {
  checkoutForAProduct
}
