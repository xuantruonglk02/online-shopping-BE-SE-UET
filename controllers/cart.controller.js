const connection = require('../models/database');
const userController = require('./user.controller');

function getAllProductsInCart(req, res) {
  const cartId = userController.getCartId(req.headers['x-access-token']);

  connection.query('SELECT product_id, amount FROM cart_has_product WHERE cart_id=?', [cartId],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ results: results });
    });
}

/**
 * productId : body
 */
function addProduct(req, res) {
  if (!req.body.productId || isNaN(req.body.productId)) {
    return res.json({ success: 0 });
  }
  req.body.productId = parseInt(req.body.productId);

  const cartId = userController.getCartId(req.headers['x-access-token']);

  connection.query('INSERT INTO cart_has_product(cart_id, product_id, amount) values (?,?,1)',
    [cartId, req.body.productId],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1 });
    });
}

/**
 * list: [{productId,amount}] : body
 */
function updateCart(req, res) {
  if (!req.body.list) { return res.json({ success: 0 }); }
  try {
    req.body.list = JSON.parse(req.body.list);
  } catch (err) {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }
  }
  if (!req.body.list.length) { return res.json({ success: 1 }); }

  for (let i = 0; i < req.body.list.length; i++) {
    if (isNaN(req.body.list[i].productId) || req.body.list[i].productId < 1
      || isNaN(req.body.list[i].amount) || req.body.list[i].amount < 1) {
      return res.json({ success: 0 });
    }
    req.body.list[i].productId = parseInt(req.body.list[i].productId);
    req.body.list[i].amount = parseInt(req.body.list[i].amount);
  }

  const cartId = userController.getCartId(req.headers['x-access-token']);

  let query = 'UPDATE cart_has_product SET amount = (CASE product_id';
  for (let i = 0; i < req.body.list.length; i++) {
    query += ' WHEN ? THEN ?';
  }
  query += ' ELSE amount END) WHERE cart_id=' + cartId;

  const params = req.body.list.reduce((p,c) => p.concat([c.productId, c.amount]), []);

  connection.query(query, params, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1 });
  });
}

/**
 * productId : body
 */
function removeProduct(req, res) {
  if (!req.body.productId || isNaN(req.body.productId) || req.body.productId < 1) {
    return res.json({ success: 0 });
  }
  req.body.productId = parseInt(req.body.productId);

  const cartId = userController.getCartId(req.headers['x-access-token']);

  connection.query('DELETE FROM cart_has_product WHERE cart_id=? AND product_id=?',
    [cartId, req.body.productId],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
      
      res.json({ success: 1 });
    });
}

module.exports = {
  getAllProductsInCart,
  addProduct,
  updateCart,
  removeProduct
}
