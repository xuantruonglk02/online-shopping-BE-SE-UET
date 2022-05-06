const { connection, commitTransaction } = require('../models/database');

/**
 * lineId
 * classId
 * name
 * price
 * sizes: [sizeId,quantity]
 * description
 * thumbnail
 */
function addProduct(req, res) {
  if (!req.body.lineId || !req.body.classId || !req.body.name || !req.body.price
    || !req.body.description || !req.body.thumbnail || !req.body.sizes
    || isNaN(req.body.price)) {
    return res.json({ success: 0 });
  }

  req.body.sizes = checkSizesList(req.body.sizes);
  if (!req.body.sizes) { return res.json({ success: 0 }); }

  req.body.price = parseInt(req.body.price);
  if (req.body.price < 1) { return res.json({ success: 0 }); }

  connection.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    connection.query('INSERT INTO Products (line_id, class_id, name, price, description, thumbnail) VALUES (?,?,?,?,?,?)',
      [req.body.lineId, req.body.classId, req.body.name, req.body.price, req.body.description, req.body.thumbnail],
      (err, results) => {
        if (err) {
          console.log(err);
          return connection.rollback(() => { return res.json({ success: 0 }); });
        }
    
        const productId = results.insertId;
        let query = 'INSERT INTO Product_has_Size (product_id,size_id,quantity) VALUES '
          + '(?,?,?),'.repeat(req.body.sizes.length).slice(0, -1);
        let params = req.body.sizes.reduce((p, c) => p.concat([productId, c.sizeId, c.quantity]), []);
        connection.query(query, params, (err, results) => {
          if (err) {
            console.log(err);
            return connection.rollback(() => { return res.json({ success: 0 }); });
          }

          return commitTransaction(connection, res);
        });
    });
  });
}

/**
 * productId
 * name
 * price
 * sizes: [sizeId,quantity]
 * description
 * thumbnail
 */
function modifyProduct(req, res) {
  if (!req.body.productId) {
    return res.json({ success: 0 });
  }

  let query = 'UPDATE Products SET', params = [];
  if (req.body.name) {
    query += ' name=?,';
    params.push(req.body.name);
  }
  if (req.body.price) {
    req.body.price = parseInt(req.body.price);
    if (req.body.price < 1) { return res.json({ success: 0 }); }
    query += ' price=?,';
    params.push(req.body.price);
  }
  if (req.body.sizes) {
    req.body.sizes = checkSizesList(req.body.sizes);
    if (!req.body.sizes) { return res.json({ success: 0 }); }
  }
  if (req.body.description) {
    query += ' description=?,';
    params.push(req.body.description);
  }
  if (req.body.thumbnail) {
    query += ' thumbnail=?,';
    params.push(req.body.thumbnail);
  }
  query = query.slice(0, -1);
  query += ' WHERE product_id=?';
  params.push(req.body.productId);

  connection.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    connection.query(query, params, (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (req.body.sizes) {
        connection.query('DELETE FROM Product_has_Size WHERE product_id=?', [req.body.productId], (err, results) => {
          if (err) {
            console.log(err);
            return res.json({ success: 0 });
          }

          let query = 'INSERT INTO Product_has_Size (product_id,size_id,quantity) VALUES '
            + '(?,?,?),'.repeat(req.body.sizes.length).slice(0, -1);
          let params = req.body.sizes.reduce((p, c) => p.concat([req.body.productId, c.sizeId, c.quantity]), []);
          connection.query(query, params, (err, results) => {
            if (err) {
              console.log(err);
              return res.json({ success: 0 });
            }

            return commitTransaction(connection, res);
          });
        });
      } else {
        return commitTransaction(connection, res);
      }
    });
  });
}

/**
 * Not use.
 * 
 * productId : body
 */
function removeProduct(req, res) {
  if (!req.body.productId) {
    return res.json({ success: 0 });
  }

  connection.query('DELETE FROM Products WHERE product_id=?', [req.body.productId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1 });
  });
}

/**
 * type
 * classId
 * name
 */
function addCategory(req, res) {
  if (!req.body.type || !req.body.name) {
    return res.json({ success: 0 });
  }

  let query, params;
  if (req.body.type === 'class') {
    query = 'INSERT INTO Product_Classes (name) VALUES (?)';
    params = [req.body.name];

  } else if (req.body.type === 'line') {
    if (!req.body.classId) {
      return res.json({ success: 0 });
    }

    query = 'INSERT INTO Product_Lines (class_id, name) VALUES (?,?)';
    params = [req.body.classId, req.body.name];
  
  } else {
    return res.json({ success: 0 });
  }

  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1 });
  });
}

/**
 * begin : body
 * quantity : body
 */
function getBills(req, res) {
  if (!req.body.begin || !req.body.quantity) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  connection.query('SELECT * FROM Bills ORDER BY create_at DESC LIMIT ?,?', [req.body.begin, req.body.quantity], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

function checkSizesList(sizes) {
  try {
    sizes = JSON.parse(sizes);
  } catch (err) {
    console.log(err);
    return 0;
  }
  if (!sizes.length) { return 0; }
  for (let i = 0; i < sizes.length; i++) {
    if (!sizes[i].sizeId || !sizes[i].quantity || isNaN(sizes[i].quantity)) {
      return 0;
    }
    sizes[i].quantity = parseInt(sizes[i].quantity);
    if (sizes[i].quantity < 1) {
      return 0;
    }
  }
  return sizes;
}

module.exports = {
  addProduct,
  modifyProduct,
  removeProduct,
  addCategory,
  getBills
}
