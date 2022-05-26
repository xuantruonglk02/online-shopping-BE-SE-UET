const { connection, commitTransaction } = require('../models/database');
const { getCartId } = require('./user.controller');

function getQuantityOfProducts(req, res) {
  const cartId = getCartId(req.cookies['x-access-token']);

  connection.query('SELECT quantity FROM Carts WHERE cart_id=?', [cartId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, result: results[0] });
  });
}

function getAllProductsForCartMenu(req, res) {
  const cartId = getCartId(req.cookies['x-access-token']);

  let query = 'SELECT p.product_id, p.name, p.price, p.thumbnail '
    + 'FROM Cart_has_Product chp '
    + 'INNER JOIN Products p ON chp.product_id = p.product_id '
    + 'WHERE chp.cart_id=? '
    + 'GROUP BY chp.product_id';
  connection.query(query, [cartId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

function getAllProducts(req, res) {
  const cartId = getCartId(req.cookies['x-access-token']);

  let query = 'SELECT p.product_id, p.name, p.price, p.thumbnail, s.size_id, s.text, chp.quantity, phs.quantity AS max_quantity '
    + 'FROM Cart_has_Product chp '
    + 'INNER JOIN Products p ON chp.product_id = p.product_id '
    + 'INNER JOIN Sizes s ON chp.size_id = s.size_id '
    + 'INNER JOIN Product_has_Size phs ON chp.product_id = phs.product_id AND chp.size_id = phs.size_id '
    + 'WHERE chp.cart_id=? '
    + 'ORDER BY chp.create_at DESC';
  connection.query(query, [cartId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

/**
 * productId : body
 * sizeId : body
 * quantity : body
 */
function addProduct(req, res) {
  if (!req.body.productId || !req.body.sizeId || !req.body.quantity
    || isNaN(req.body.sizeId) || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }
  req.body.sizeId = parseInt(req.body.sizeId);
  req.body.quantity = parseInt(req.body.quantity);

  const cartId = getCartId(req.cookies['x-access-token']);
  connection.query('SELECT quantity FROM Carts WHERE cart_id=?', [cartId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }
    if (results[0].quantity + req.body.quantity > 30) {
      return res.json({ success: 0, code: 'max-in-cart', max: 30 });
    }

    connection.query('INSERT INTO Cart_has_Product (cart_id, product_id, size_id, quantity) values (?,?,?,?)',
    [cartId, req.body.productId, req.body.sizeId, req.body.quantity], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0, code: err.code });
      }

      res.json({ success: 1 });
    });
  });
}

/**
 * list: [{productId,sizeId,quantity}] : body
 */
function updateCart(req, res) {
  if (!req.body.list) {
    return res.status(400).json({ success: 0 });
  }

  try {
    req.body.list = JSON.parse(req.body.list);
  } catch (err) {
    if (err) {
      console.log(err);
      return res.status(400).json({ success: 0 });
    }
  }

  for (let i = 0; i < req.body.list.length; i++) {
    if (!req.body.list[i].productId  || !req.body.list[i].sizeId || !req.body.list[i].quantity
      || isNaN(req.body.list[i].sizeId) || isNaN(req.body.list[i].quantity)) {
      return res.status(400).json({ success: 0 });
    }
    req.body.list[i].sizeId = parseInt(req.body.list[i].sizeId);
    req.body.list[i].quantity = parseInt(req.body.list[i].quantity);
    if (req.body.list[i].quantity < 1) { return res.status(400).json({ success: 0 }); }
  }

  if (req.body.list.length > 30) {
    return res.json({ success: 0, code: 'max-in-cart', max: 30 });
  }

  const cartId = getCartId(req.cookies['x-access-token']);

  if (req.body.list.length == 0) {
    connection.query('DELETE FROM Cart_has_Product WHERE cart_id=?', [cartId], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: 0 });
      }

      return res.json({ success: 1 });
    });
  } else {
    connection.beginTransaction((err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ success: 0 });
      }
  
      connection.query('DELETE FROM Cart_has_Product WHERE cart_id=?', [cartId], (err, results) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ success: 0 });
        }
  
        let query = 'INSERT INTO Cart_has_Product (cart_id, product_id, size_id, quantity) VALUES '
          + '(?,?,?,?),'.repeat(req.body.list.length).slice(0, -1);
        let params = req.body.list.reduce((p, c) => p.concat([cartId, c.productId, c.sizeId, c.quantity]), []);
        connection.query(query, params, (err, results) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ success: 0 });
          }
  
          return commitTransaction(connection, res);
        });
      });
    });
  }
}

/**
 * productId : body
 * sizeId : body
 */
function removeProduct(req, res) {
  if (!req.body.productId || !req.body.sizeId) {
    return res.json({ success: 0 });
  }

  const cartId = getCartId(req.cookies['x-access-token']);

  connection.query('DELETE FROM Cart_has_Product WHERE cart_id=? AND product_id=? AND size_id=?',
    [cartId, req.body.productId, req.body.sizeId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
      
      res.json({ success: 1 });
    });
}

/**
 * list : body : [productId,sizeId]
 */
 function removeProducts(req, res) {
  if (!req.body.list) {
    return res.json({ success: 0 });
  }
  try {
    req.body.list = JSON.parse(req.body.list);
  } catch (err) {
    console.log(err);
    return res.json({ success: 0 });
  }
  if (!req.body.list.length) { return res.json({ success: 0 }); }
  for (let i = 0; i < req.body.list.length; i++) {
    if (!req.body.list[i].productId || !req.body.list[i].sizeId) {
      return res.json({ success: 0 });
    }
  }

  let query = 'DELETE FROM Cart_has_Product WHERE cart_id=? AND ('
    + '(product_id=? AND size_id=?) OR '.repeat(req.body.list.length).slice(0, -4) + ')';
  let params = req.body.list.reduce((p, c) => p.concat([c.productId, c.sizeId]), []);
  const cartId = getCartId(req.cookies['x-access-token']);
  connection.query(query, [cartId].concat(params), (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }
    
    res.json({ success: 1 });
  });
}

module.exports = {
  getQuantityOfProducts,
  getAllProductsForCartMenu,
  getAllProducts,
  addProduct,
  updateCart,
  removeProduct,
  removeProducts
}
