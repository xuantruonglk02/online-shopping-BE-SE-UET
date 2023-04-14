const createError = require('http-errors');
const { promisePool } = require('../models/database');
const { clientElasticSearch, indexName } = require('../services/elastichsearch.service');

/**
 * productId
 * callback
 */
async function getProductById(productId) {
    try {
        const query =
            `SELECT product_id, name, price, sold, quantity_of_rating, rating, description, thumbnail, ` +
            `(SELECT CONCAT('[',GROUP_CONCAT(CONCAT('"',url,'"')),']') FROM preview_images WHERE product_id=? GROUP BY product_id) AS urls, ` +
            `(SELECT CONCAT('[',GROUP_CONCAT(CONCAT('{"sizeId":',phs.size_id,',"size":"',s.text,'","quantity":',phs.quantity,'}')),']') ` +
            `FROM product_has_size phs INNER JOIN sizes s ON phs.size_id=s.size_id WHERE phs.product_id=? GROUP BY phs.product_id) AS sizes ` +
            `FROM products WHERE product_id=?`;
        // TODO: must use execute
        const [rows, fields] = await promisePool.query(query, [
            productId,
            productId,
            productId,
        ]);
        return rows?.[0];
    } catch (error) {
        throw error;
    }
}

/**
 * list : query : []
 */
async function getProductsForCheckout(req, res, next) {
    try {
        if (!req.query.list) {
            return res.status(400).json({ success: 0 });
        }
        try {
            req.query.list = JSON.parse(req.query.list);
        } catch (err) {
            return res.status(400).json({ success: 0 });
        }
        if (!(req.query.list instanceof Array) || !req.query.list.length) {
            return res.status(400).json({ success: 0 });
        }

        const query =
            'SELECT product_id, name, price, thumbnail FROM products WHERE ' +
            'product_id=? OR '.repeat(req.query.list.length).slice(0, -4);
        // TODO: must use execute
        const [rows, fields] = await promisePool.query(query, req.query.list);
        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * categoryId : param
 * category : query
 * page : query
 * minPrice : query
 * maxPrice : query
 * minStar : query
 * orderBy : query : newest|priceASC|priceDESC|soldDESC|aoRatingDESC|ratingDESC
 */
async function getProductsByCategory(req, res, next) {
    try {
        if (
            (req.query.category != 'class' && req.query.category != 'line') ||
            !req.query.page ||
            isNaN(req.query.page)
        ) {
            return res.status(400).json({ success: 0 });
        }
        req.query.page = parseInt(req.query.page);
        if (req.query.page < 0) {
            return res.status(400).json({ success: 0 });
        }

        let query =
            'SELECT SQL_CALC_FOUND_ROWS product_id, name, price, sold, rating, thumbnail FROM products WHERE ' +
            req.query.category +
            '_id=?';
        let params = [req.params.categoryId];
        if (req.query.minPrice && !isNaN(req.query.minPrice)) {
            req.query.minPrice = parseInt(req.query.minPrice);
            if (req.query.minPrice > 0) {
                query += ' AND price>=?';
                params.push(req.query.minPrice);
            }
        }
        if (req.query.maxPrice && !isNaN(req.query.maxPrice)) {
            req.query.maxPrice = parseInt(req.query.maxPrice);
            if (req.query.maxPrice > 0) {
                query += ' AND price<=?';
                params.push(req.query.maxPrice);
            }
        }
        if (req.query.minStar && !isNaN(req.query.minStar)) {
            req.query.minStar = parseInt(req.query.minStar);
            if (req.query.minStar >= 1 && req.query.minStar <= 5) {
                query += ' AND rating>=?';
                params.push(req.query.minStar);
            }
        }
        switch (req.query.orderBy) {
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
                query += ' ORDER BY created_at DESC';
                break;
            default:
                query += ' ORDER BY created_at DESC';
        }
        query += ' LIMIT ?,15';
        params.push((req.query.page - 1) * 15);

        // TODO: must use execute
        const [rows, fields] = await promisePool.query(query, params);
        const [counts, _] = await promisePool.execute('SELECT FOUND_ROWS() as count');
        res.status(200).json({
            success: 1,
            results: rows,
            totalRows: counts[0].count,
        });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * begin : query
 * quantity : query
 */
async function getNewProducts(req, res, next) {
    try {
        if (
            !req.query.begin ||
            isNaN(req.query.begin) ||
            !req.query.quantity ||
            isNaN(req.query.quantity)
        ) {
            return res.status(400).json({ success: 0 });
        }

        req.query.begin = parseInt(req.query.begin);
        req.query.quantity = parseInt(req.query.quantity);

        const query =
            'SELECT product_id, name, price, sold, rating, thumbnail FROM products ORDER BY created_at DESC LIMIT ?,?';
        // TODO: must use execute
        const [rows, fields] = await promisePool.query(query, [
            req.query.begin,
            req.query.quantity,
        ]);
        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

async function getAllProductClasses(req, res, next) {
    try {
        const [rows, fields] = await promisePool.execute('SELECT * FROM product_classes');
        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

async function getAllProductLines(req, res, next) {
    try {
        const [rows, fields] = await promisePool.execute('SELECT * FROM product_lines');
        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * classId : params
 */
async function getAllProductLinesByClass(req, res, next) {
    try {
        // TODO: must use execute
        const [rows, fields] = await promisePool.query(
            'SELECT * FROM product_lines WHERE class_id=?',
            [req.params.classId],
        );
        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

async function getAllCategories(req, res, next) {
    try {
        const query =
            `SELECT pc.class_id, pc.name, ` +
            `CONCAT("[",GROUP_CONCAT(CONCAT('{"lineId":"',pl.line_id,'","name":"',pl.name,'"}')),"]") AS product_lines ` +
            `FROM product_classes pc ` +
            `INNER JOIN product_lines pl ON pc.class_id = pl.class_id ` +
            `GROUP BY pc.class_id ` +
            `ORDER BY pc.class_id ASC, pl.line_id ASC`;
        const [rows, fields] = await promisePool.execute(query);
        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * keyword : query
 * page : query
 *
 * classId : query
 * lineId : query
 * minPrice : query
 * maxPrice : query
 * minStar : query
 * orderBy : query : newest|priceASC|priceDESC|soldDESC|qoRatingDESC|ratingDESC
 */
async function searchProductsByKeyword(req, res, next) {
    try {
        if (req.query.keyword == '') {
            return res.json({ success: 1, results: [], totalRows: 0 });
        }
        if (!req.query.keyword || !req.query.page || isNaN(req.query.page)) {
            return res.status(400).json({ success: 0 });
        }

        req.query.page = parseInt(req.query.page);
        if (req.query.page < 0) {
            return res.status(400).json({ success: 0 });
        }

        const querySearch = {
            query: { bool: { must: [] } },
            sort: ['_score'],
        };

        if (req.query.keyword) {
            querySearch.query.bool.must.push({
                bool: {
                    should: [
                        {
                            match: { name: req.query.keyword },
                        },
                        {
                            match: { description: req.query.keyword },
                        },
                    ],
                },
            });
        }

        // TODO: apply search class and line
        // if (req.query.classId) {
        //     querySearch.query.classId = req.query.classId;
        // }
        // if (req.query.lineId) {
        //     querySearch.query.lineId = req.query.lineId;
        // }
        if (req.query.minPrice && !isNaN(req.query.minPrice)) {
            req.query.minPrice = parseInt(req.query.minPrice);
            if (req.query.minPrice > 0) {
                querySearch.query.bool.must.push({
                    range: { price: { gte: req.query.minPrice } },
                });
            }
        }
        if (req.query.maxPrice && !isNaN(req.query.maxPrice)) {
            req.query.maxPrice = parseInt(req.query.maxPrice);
            if (req.query.maxPrice > 0) {
                querySearch.query.bool.must.push({
                    range: { price: { lte: req.query.maxPrice } },
                });
            }
        }
        if (req.query.minStar && !isNaN(req.query.minStar)) {
            req.query.minStar = parseInt(req.query.minStar);
            if (req.query.minStar >= 1 && req.query.minStar <= 5) {
                querySearch.query.bool.must.push({
                    range: { rating: { gte: req.query.minStar } },
                });
            }
        }
        switch (req.query.orderBy) {
            case 'priceASC':
                querySearch.sort.push({
                    price: { order: 'asc' },
                });
                break;
            case 'priceDESC':
                querySearch.sort.push({
                    price: { order: 'desc' },
                });
                break;
            case 'soldDESC':
                querySearch.sort.push({
                    sold: { order: 'desc' },
                });
                break;
            case 'qoRatingDESC':
                querySearch.sort.push({
                    quantity_of_rating: { order: 'desc' },
                });
                break;
            case 'ratingDESC':
                querySearch.sort.push({
                    rating: { order: 'desc' },
                });
                break;
            case 'newest':
                querySearch.sort.push({
                    created_at: { order: 'desc' },
                });
                break;
            default:
                querySearch.sort.push({
                    created_at: { order: 'desc' },
                });
        }
        if (req.query.page && !isNaN(req.query.page)) {
            req.query.page = parseInt(req.query.page);
            if (req.query.page > 0) {
                querySearch.from = (req.query.page - 1) * 15;
                querySearch.size = 15;
            }
        }

        const result = await clientElasticSearch.search({
            index: indexName,
            body: querySearch,
        });
        return res.json({
            success: 1,
            results: result.hits.hits.map((e) => e._source),
            totalRows: result.hits.total.value,
        });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * productId : params
 */
async function getAllRatingsOfProduct(req, res, next) {
    try {
        // TODO: must use execute
        const [rows, fields] = await promisePool.query(
            'SELECT u.user_id, r.star, r.comment, r.created_at, u.name ' +
                'FROM ratings r ' +
                'INNER JOIN users u ON r.user_id=u.user_id ' +
                'WHERE r.product_id=? ' +
                'GROUP BY r.rating_id ' +
                'ORDER BY r.created_at DESC',
            [req.params.productId],
        );
        res.json({
            success: 1,
            results: rows,
            userId: req.session.userId,
        });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * productId : params
 * star : body
 * comment : body
 */
async function insertUserRating(req, res, next) {
    try {
        if (!req.body.comment || isNaN(req.body.star)) {
            return res.status(400).json({ success: 0 });
        }
        req.body.star = parseInt(req.body.star);

        const userId = req.session.userId;

        const bought = await checkUserBoughtProduct(userId, req.params.productId);
        if (!bought) {
            return res.json({ success: 0, code: 'not-buy' });
        }

        // TODO: must use execute
        const [rows, fields] = await promisePool.query(
            'SELECT rating_id FROM ratings WHERE user_id=? AND product_id=?',
            [userId, req.params.productId],
        );
        if (rows.length > 0) {
            return res.json({ success: 0, code: 'rating-exist' });
        }

        // TODO: must use execute
        await promisePool.query(
            'INSERT INTO ratings (user_id, product_id, star, comment) VALUES (?,?,?,?)',
            [userId, req.params.productId, req.body.star, req.body.comment],
        );
        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

async function checkUserBoughtProduct(userId, productId) {
    try {
        // TODO: must use execute
        const [rows, fields] = await promisePool.query(
            'SELECT bill_id FROM bills WHERE user_id=? AND bill_id IN ' +
                '(SELECT bill_id FROM bill_has_product WHERE product_id=?)',
            [userId, productId],
        );
        return rows.length !== 0;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getProductById,
    getProductsForCheckout,
    getProductsByCategory,
    getAllCategories,
    getAllProductClasses,
    getAllProductLines,
    getAllProductLinesByClass,
    getNewProducts,
    searchProductsByKeyword,
    getAllRatingsOfProduct,
    insertUserRating,
    checkUserBoughtProduct,
};
