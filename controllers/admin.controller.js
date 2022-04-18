const connection = require('../models/database');

/**
 * lineId
 * classId
 * name
 * price
 * amount
 * description
 * thumbnail
 */
function addProduct(req, res) {
  if (!req.body.lineId || !req.body.classId || !req.body.name || !req.body.price
    || !req.body.amount || !req.body.description || !req.body.thumbnail
    || isNaN(req.body.price || isNaN(req.body.amount))) {
    return res.json({ success: 0 });
  }

  req.body.price = parseInt(req.body.price);
  req.body.amount = parseInt(req.body.amount);

  connection.beginTransaction((err) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    connection.query('INSERT INTO product (line_id, class_id, name, price, amount, description, thumbnail) VALUES (?,?,?,?,?,?,?)',
      [req.body.lineId, req.body.classId, req.body.name, req.body.price, req.body.amount, req.body.description, req.body.thumbnail],
      (err, results) => {
        if (err) {
          console.log(err);
          return connection.rollback(() => {
            return res.json({ success: 0 });
          });
        }

        connection.query('UPDATE product_line SET amount=amount+? WHERE id=?',
          [req.body.amount, req.body.lineId], (err, results) => {
            if (err) {
              console.log(err);
              return connection.rollback(() => {
                return res.json({ success: 0 });
              });
            }

            connection.query('UPDATE product_class SET amount=amount+? WHERE id=?',
              [req.body.amount, req.body.classId], (err, results) => {
                if (err) {
                  console.log(err);
                  return connection.rollback(() => {
                    return res.json({ success: 0 });
                  });
                }

                connection.commit((err) => {
                  if (err) {
                    console.log(err);
                    return connection.rollback(() => {
                      return res.json({ success: 0 });
                    });
                  }
                
                  res.json({ success: 1 });
                });
              });
          });
      });
  });
}

/**
 * productId
 * lineId
 * classId
 * name
 * price
 * amount
 * description
 * thumbnail
 */
function modifyProduct(req, res) {
  if (!req.body.productId) {
    return res.json({ success: 0 });
  }

  let query = 'UPDATE product SET', params = [];
  if (req.body.lineId) {
    query += ' line_id=?,';
    params.push(req.body.lineId);
  }
  if (req.body.classId) {
    query += ' class_id=?,';
    params.push(req.body.classId);
  }
  if (req.body.name) {
    query += ' name=?,';
    params.push(req.body.name);
  }
  if (req.body.price) {
    req.body.price = parseInt(req.body.price);
    query += ' price=?,';
    params.push(req.body.price);
  }
  if (req.body.amount) {
    req.body.amount = parseInt(req.body.amount);
    query += ' amount=?,';
    params.push(req.body.amount);
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
  query += ' WHERE id=?';
  params.push(req.body.productId);

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
  if (!req.body.productId) {
    return res.json({ success: 0 });
  }

  connection.query('DELETE FROM product WHERE id=?', [req.body.productId], (err, results, fields) => {
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
    query = 'INSERT INTO product_class (name) VALUES (?)';
    params = [req.body.name];

  } else if (req.body.type === 'line') {
    if (!req.body.classId) {
      return res.json({ success: 0 });
    }

    query = 'INSERT INTO product_line (class_id, name) VALUES (?,?)';
    params = [req.body.classId, req.body.name];
  
  } else {
    return res.json({ success: 0 });
  }

  connection.query(query, params, (err, results, fields) => {
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

  connection.query('SELECT * FROM bill LIMIT ?,?', [req.body.begin, req.body.quantity],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

module.exports = {
  addProduct,
  modifyProduct,
  removeProduct,
  addCategory,
  getBills
}
