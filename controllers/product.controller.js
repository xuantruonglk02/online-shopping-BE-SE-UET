const connection = require('../models/database');

/**
 * id : params
 */
function getProductById(req, res) {
  connection.query('SELECT * FROM product WHERE id=?', [req.params.id], (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, result: results.length ? results[0] : {} });
  });
}

/**
 * lineId : params
 * begin : body
 * quantity : body
 */
function getProductsByLine(req, res) {
  if (!req.body.begin || isNaN(req.body.begin) || !req.body.quantity || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  connection.query('SELECT * FROM product WHERE line_id=? ORDER BY create_at DESC LIMIT ?,?',
    [req.params.lineId, req.body.begin, req.body.quantity],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

/**
 * classId : params
 * begin : body
 * quantity : body
 */
function getProductsByClass(req, res) {
  if (!req.body.begin || isNaN(req.body.begin) || !req.body.quantity || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  connection.query('SELECT * FROM product WHERE class_id=? ORDER BY create_at DESC LIMIT ?,?',
    [req.params.classId, req.body.begin, req.body.quantity],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

/**
 * begin : body
 * quantity : body
 */
function getNewProducts(req, res) {
  if (!req.body.begin || isNaN(req.body.begin) || !req.body.quantity || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  connection.query('SELECT * FROM product ORDER BY create_at DESC LIMIT ?,?',
    [req.body.begin, req.body.quantity],
    (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

module.exports = {
  getProductById,
  getProductsByLine,
  getProductsByClass,
  getNewProducts
}
