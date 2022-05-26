const { connection } = require('../models/database');
const { getUserId } = require('./user.controller');

/**
 * productId
 * callback
 */
function getProductById(productId, callback) {
  let query = `SELECT product_id, name, price, sold, quantity_of_rating, rating, description, thumbnail, `
    + `(SELECT CONCAT('[',GROUP_CONCAT(CONCAT('"',url,'"')),']') FROM Preview_Images WHERE product_id=? GROUP BY product_id) AS urls, `
    + `(SELECT CONCAT('[',GROUP_CONCAT(CONCAT('{"sizeId":',phs.size_id,',"size":"',s.text,'","quantity":',phs.quantity,'}')),']') `
    + `FROM Product_has_Size phs INNER JOIN Sizes s ON phs.size_id=s.size_id WHERE phs.product_id=? GROUP BY phs.product_id) AS sizes `
    + `FROM Products WHERE product_id=?`;
  connection.query(query, [productId, productId, productId], (err, results) => {
    if (err) {
      return callback(err, null);
    }

    callback(null, results[0]);
  });
}

function getProductByIdForCheckout(productId, callback) {
  connection.query('SELECT name, price, thumbnail FROM Products WHERE product_id=?', [productId], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
}

/**
 * categoryId : param
 * category : body
 * page : body
 * 
 * minPrice : body
 * maxPrice : body
 * minStar : body
 * orderBy : body : newest|priceASC|priceDESC|soldDESC|aoRatingDESC|ratingDESC
 */
function getProductsByCategory(req, res) {
  if ((req.body.category != 'class' && req.body.category != 'line') || !req.body.page
    || isNaN(req.body.page)) {
    return res.status(400).json({ success: 0 });
  }
  req.body.page = parseInt(req.body.page);
  if (req.body.page < 0) {
    return res.status(400).json({ success: 0 });
  }

  let query = 'SELECT SQL_CALC_FOUND_ROWS product_id, name, price, sold, rating, thumbnail FROM Products WHERE ' + req.body.category + '_id=?';
  let params = [req.params.categoryId];
  if (req.body.minPrice && !isNaN(req.body.minPrice)) {
    req.body.minPrice = parseInt(req.body.minPrice);
    if (req.body.minPrice > 0) {
      query += ' AND price>=?';
      params.push(req.body.minPrice);
    }
  }
  if (req.body.maxPrice && !isNaN(req.body.maxPrice)) {
    req.body.maxPrice = parseInt(req.body.maxPrice);
    if (req.body.maxPrice > 0) {
      query += ' AND price<=?';
      params.push(req.body.maxPrice);
    }
  }
  if (req.body.minStar && !isNaN(req.body.minStar)) {
    req.body.minStar = parseInt(req.body.minStar);
    if (req.body.minStar >= 1 && req.body.minStar <= 5) {
      query += ' AND rating>=?';
      params.push(req.body.minStar);
    }
  }
  switch (req.body.orderBy) {
    case 'priceASC':
      query += ' ORDER BY price ASC';
      break;
    case 'priceDESC':
      query += ' ORDER BY price DESC';
      break;
    case 'soldDESC':
      query += ' ORDER BY sold DESC';
      break;
    case 'qoRatingDESC':
      query += ' ORDER BY quantity_of_rating DESC';
      break;
    case 'ratingDESC':
      query += ' ORDER BY rating DESC';
      break;
    case 'newest':
      query += ' ORDER BY create_at DESC';
      break;
    default:
      query += ' ORDER BY create_at DESC';
  }
  query += ' LIMIT ?,15';
  params.push((req.body.page - 1) * 15);

  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: 0 });
    }

    const rows = results;
    connection.query('SELECT FOUND_ROWS() as count', (err, results) => {
      if (results[0].count) {
        res.status(200).json({ success: 1, results: rows, totalRows: results[0].count });
      } else {
        res.status(200).json({ success: 1, results: rows });
      }
    });
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

  connection.query('SELECT product_id, name, price, sold, rating, thumbnail FROM Products ORDER BY create_at DESC LIMIT ?,?',
    [req.body.begin, req.body.quantity], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      res.json({ success: 1, results: results });
    });
}

function getAllProductClasses(req, res) {
  connection.query('SELECT * FROM Product_Classes', (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

function getAllProductLines(req, res) {
  connection.query('SELECT * FROM Product_Lines', (err, results) => {
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
  connection.query('SELECT * FROM Product_Lines WHERE class_id=?', [req.params.classId], (err, results) => {
    if (err) {
      console.log(err);
      return res.json({ success: 0 });
    }

    res.json({ success: 1, results: results });
  });
}

function getAllCategories(req, res) {
  connection.query(`SELECT pc.class_id, pc.name, `
    + `CONCAT("[",GROUP_CONCAT(CONCAT('{"lineId":"',pl.line_id,'","name":"',pl.name,'"}')),"]") AS product_lines `
    + `FROM Product_Classes pc `
    + `INNER JOIN Product_Lines pl ON pc.class_id = pl.class_id `
    + `GROUP BY pc.class_id `
    + `ORDER BY pc.create_at, pl.create_at`, (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }
      
      res.json({ success: 1, results: results });
    });
}

/**
 * keyword : body
 * page : body
 * 
 * classId : body
 * lineId : body
 * minPrice : body
 * maxPrice : body
 * minStar : body
 * orderBy : body : newest|priceASC|priceDESC|soldDESC|qoRatingDESC|ratingDESC
 */
function searchProductsByKeyword(req, res) {
  if (req.body.keyword == '') {
    return res.json({ success: 1, results: [], totalRows: 0 });
  }
  if (!req.body.keyword || !req.body.page || isNaN(req.body.page)) {
    return res.status(400).json({ success: 0 });
  }
  
  req.body.page = parseInt(req.body.page);
  if (req.body.page < 0) {
    return res.status(400).json({ success: 0 });
  }

  let query = 'SELECT SQL_CALC_FOUND_ROWS product_id, name, price, sold, rating, thumbnail FROM Products WHERE name LIKE CONCAT("%",?,"%")';
  let params = [req.body.keyword];
  if (req.body.classId) {
    query += ' AND class_id=?';
    params.push(req.body.classId);
  }
  if (req.body.lineId) {
    query += ' AND line_id=?';
    params.push(req.body.lineId);
  }
  if (req.body.minPrice && !isNaN(req.body.minPrice)) {
    req.body.minPrice = parseInt(req.body.minPrice);
    if (req.body.minPrice > 0) {
      query += ' AND price>=?';
      params.push(req.body.minPrice);
    }
  }
  if (req.body.maxPrice && !isNaN(req.body.maxPrice)) {
    req.body.maxPrice = parseInt(req.body.maxPrice);
    if (req.body.maxPrice > 0) {
      query += ' AND price<=?';
      params.push(req.body.maxPrice);
    }
  }
  if (req.body.minStar && !isNaN(req.body.minStar)) {
    req.body.minStar = parseInt(req.body.minStar);
    if (req.body.minStar >= 1 && req.body.minStar <= 5) {
      query += ' AND rating>=?';
      params.push(req.body.minStar);
    }
  }
  switch (req.body.orderBy) {
    case 'priceASC':
      query += ' ORDER BY price ASC';
      break;
    case 'priceDESC':
      query += ' ORDER BY price DESC';
      break;
    case 'soldDESC':
      query += 'ORDER BY sold DESC';
      break;
    case 'qoRatingDESC':
      query += ' ORDER BY quantity_of_rating DESC';
      break;
    case 'ratingDESC':
      query += ' ORDER BY rating DESC';
      break;
    case 'newest':
      query += ' ORDER BY create_at DESC';
      break;
    default:
      query += ' ORDER BY create_at DESC';
  }
  query += ' LIMIT ?,15';
  params.push((req.body.page - 1) * 15);
  
  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: 0 });
    }

    const rows = results;
    connection.query('SELECT FOUND_ROWS() as count', (err, results) => {
      if (results[0].count) {
        res.status(200).json({ success: 1, results: rows, totalRows: results[0].count });
      } else {
        res.status(200).json({ success: 1, results: rows });
      }
    });
  });
}

/**
 * productId : params
 */
function getAllRatingsOfProduct(req, res) {
  connection.query('SELECT r.star, r.comment, r.create_at, GROUP_CONCAT(ri.url) AS urls, u.name '
    + 'FROM Ratings r '
    + 'INNER JOIN Users u ON r.user_id=u.id '
    + 'LEFT JOIN Rating_Images ri ON r.id=ri.rating_id '
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
  connection.query('INSERT INTO Ratings (user_id, product_id, star, comment) VALUES (?,?,?,?)',
    [userId, req.params.productId, req.body.star, req.body.comment], (err, results) => {
      if (err) {
        console.log(err);
        return res.json({ success: 0 });
      }

      if (!req.body.urls.length) {
        return res.json({ success: 1 });
      }

      let ratingId = results.insertId;
      let query = 'INSERT INTO Rating_Images (rating_id, url) VALUES ' + '(?,?),'.repeat(req.body.urls.length).slice(0, -1);
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
  getProductByIdForCheckout,
  getProductsByCategory,
  getAllCategories,
  getAllProductClasses,
  getAllProductLines,
  getAllProductLinesByClass,
  getAllRatingsOfProduct,
  getNewProducts,
  searchProductsByKeyword,
  insertUserRating
}
