const { connection } = require('../models/database');
const { getUserId } = require('./user.controller');

/**
 * productId
 * callback
 */
function getProductById(productId, callback) {
  let query = 'SELECT product_id, name, price, sold, quantity_of_rating, rating, description, thumbnail,'
    + ' (SELECT CONCAT("[",GROUP_CONCAT(CONCAT(\'"\',url,\'"\')),"]") FROM preview_images WHERE product_id=? GROUP BY product_id) AS urls,'
    + ' (SELECT CONCAT("[",GROUP_CONCAT(CONCAT(\'{"sizeId":\',size_id,\',"quantity":\',quantity,"}")),"]") FROM product_has_size WHERE product_id=? GROUP BY product_id) AS sizes'
    + ' FROM products WHERE product_id=?';
  connection.query(query, [productId, productId, productId], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    callback(null, results[0]);
  });
}

/**
 * lineId : params
 * begin : body
 * quantity : body
 * 
 * sortBy : body : priceASC|priceDESC|soldDESC|aoRatingDESC|ratingDESC
 */
function getAllProductsByLine(req, res) {
  if (!req.body.begin || isNaN(req.body.begin) || !req.body.quantity || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  let query = 'SELECT product_id, name, price, sold, rating, thumbnail FROM products WHERE line_id=? ORDER BY ';
  switch (req.body.sortBy) {
    case 'priceASC':
      query += 'price ASC';
      break;
    case 'priceDESC':
      query += 'price DESC';
      break;
    case 'soldDESC':
      query += 'sold DESC';
      break;
    case 'aoRatingDESC':
      query += 'amount_of_rating DESC';
      break;
    case 'ratingDESC':
      query += 'rating DESC';
      break;
    default:
      query += 'create_at DESC';
  }
  query += ' LIMIT ?,?';

  connection.query(query, [req.params.lineId, req.body.begin, req.body.quantity], (err, results) => {
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
 * 
 * sortBy : body : priceASC|priceDESC|soldDESC|aoRatingDESC|ratingDESC
 */
function getAllProductsByClass(req, res) {
  if (!req.body.begin || isNaN(req.body.begin) || !req.body.quantity || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  let query = 'SELECT product_id, name, price, sold, rating, thumbnail FROM products WHERE class_id=? ORDER BY ';
  switch (req.body.sortBy) {
    case 'priceASC':
      query += 'price ASC';
      break;
    case 'priceDESC':
      query += 'price DESC';
      break;
    case 'soldDESC':
      query += 'sold DESC';
      break;
    case 'aoRatingDESC':
      query += 'amount_of_rating DESC';
      break;
    case 'ratingDESC':
      query += 'rating DESC';
      break;
    default:
      query += 'create_at DESC';
  }
  query += ' LIMIT ?,?';

  connection.query(query, [req.params.classId, req.body.begin, req.body.quantity], (err, results) => {
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

  connection.query('SELECT product_id, name, price, sold, rating, thumbnail FROM products ORDER BY create_at DESC LIMIT ?,?',
    [req.body.begin, req.body.quantity], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

function getAllProductClasses(req, res) {
  connection.query('SELECT * FROM product_classes', (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

function getAllProductLines(req, res) {
  connection.query('SELECT * FROM product_lines', (err, results) => {
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
  connection.query('SELECT * FROM product_lines WHERE class_id=?', [req.params.classId], (err, results) => {
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
  if (!req.body.key || !req.body.begin || !req.body.quantity || isNaN(req.body.begin) || isNaN(req.body.quantity)) {
    return res.json({ success: 0 });
  }

  req.body.begin = parseInt(req.body.begin);
  req.body.quantity = parseInt(req.body.quantity);

  let query = 'SELECT product_id, name, price, sold, rating, thumbnail FROM products WHERE name LIKE CONCAT("%",?,"%")';
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
    default:
      query += ' ORDER BY create_at DESC';
  }
  query += ' LIMIT ?,?';
  params.push(req.body.begin, req.body.quantity);

  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

/**
 * productId : params
 */
function getAllRatingsOfProduct(req, res) {
  connection.query('SELECT r.star, r.comment, r.create_at, GROUP_CONCAT(ri.url) AS urls, u.name '
    + 'FROM ratings r '
    + 'INNER JOIN users u ON r.user_id=u.id '
    + 'LEFT JOIN rating_images ri ON r.id=ri.rating_id '
    + 'WHERE r.product_id=? '
    + 'GROUP BY r.id '
    + 'ORDER BY r.create_at DESC',
    [req.params.productId], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

/**
 * productId : params
 * star : body
 * comment : body
 * urls: [url] : body
 */
function insertUserRating(req, res) {
  if (!req.body.star || !req.body.comment || !req.body.urls) {
    return res.json({ success: 0 });
  }
  try {
    req.body.urls = JSON.parse(req.body.urls);
  } catch (err) {
    return res.json({ success: 0 });
  }

  req.body.star = parseInt(req.body.star);

  const userId = getUserId(req.headers['x-access-token']);
  connection.query('INSERT INTO ratings (user_id, product_id, star, comment) VALUES (?,?,?,?)',
    [userId, req.params.productId, req.body.star, req.body.comment], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (!req.body.urls.length) {
        return res.json({ success: 1 });
      }

      let ratingId = results.insertId;
      let query = 'INSERT INTO rating_images (rating_id, url) VALUES ' + '(?,?),'.repeat(req.body.urls.length).slice(0, -1);
      let params = req.body.urls.reduce((p, c) => p.concat([ratingId, c]), []);
      connection.query(query, params, (err, results) => {
        if (err) {
          console.log(err);
          return res.json({ success: 0 });
        }

        res.json({ success: 1 });
      });
    });
}

module.exports = {
  getProductById,
  getAllProductsByLine,
  getAllProductsByClass,
  getAllProductClasses,
  getAllProductLines,
  getAllProductLinesByClass,
  getAllRatingsOfProduct,
  getNewProducts,
  searchProductsByKeyword,
  insertUserRating
}
