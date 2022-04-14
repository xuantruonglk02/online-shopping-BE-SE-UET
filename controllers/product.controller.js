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
function getAllProductsByLine(req, res) {
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
function getAllProductsByClass(req, res) {
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

function getAllProductClasses(req, res) {
  connection.query('SELECT * FROM product_class', (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

function getAllProductLines(req, res) {
  connection.query('SELECT * FROM product_line', (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

/**
 * classId : params
 */
function getAllProductLinesByClass(req, res) {
  connection.query('SELECT * FROM product_line WHERE class_id=?', [req.params.classId], (err, results, fields) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

/**
 * key : body
 * begin : body
 * quantity : body
 * 
 * classId : body
 * lineId : body
 * sortBy : body : priceASC|priceDESC|soldDESC|aoRatingDESC|ratingDESC
 */
function searchProductsByKeyword(req, res) {
  if (!req.body.key || !req.body.begin || !req.body.quantity
    || isNaN(req.body.begin) || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }
  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  let query = 'SELECT * FROM product WHERE name LIKE CONCAT("%",?,"%")';
  let params = [req.body.key];
  if (req.body.classId) {
    query += ' AND class_id=?';
    params.push(req.body.classId);
  }
  if (req.body.lineId) {
    query += ' AND line_id=?';
    params.push(req.body.lineId);
  }
  switch (req.body.sortBy) {
    case 'priceASC':
      query += ' ORDER BY price ASC';
      break;
    case 'priceDESC':
      query += ' ORDER BY price DESC';
      break;
    case 'soldDESC':
      query += ' ORDER BY sold DESC';
      break;
    case 'aoRatingDESC':
      query += ' ORDER BY amount_of_rating DESC';
      break;
    case 'ratingDESC':
      query += ' ORDER BY rating DESC';
      break;
  }
  query += ' LIMIT ?,?';
  params.push(req.body.begin, req.body.quantity);

  connection.query(query, params, (err, results, fields) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json(results);
  });
}

module.exports = {
  getProductById,
  getAllProductsByLine,
  getAllProductsByClass,
  getNewProducts,
  getAllProductClasses,
  getAllProductLines,
  getAllProductLinesByClass,
  searchProductsByKeyword
}
