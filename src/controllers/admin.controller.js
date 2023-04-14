const createError = require('http-errors');
const { promisePool } = require('../models/database');

/**
 * lineId
 * classId
 * name
 * price
 * sizes: [sizeId,quantity]
 * description
 * thumbnail
 */
async function addProduct(req, res, next) {
    const connection = await promisePool.getConnection();
    try {
        if (
            !req.body.lineId ||
            !req.body.classId ||
            !req.body.name ||
            !req.body.price ||
            !req.body.description ||
            !req.body.thumbnail ||
            !req.body.sizes ||
            isNaN(req.body.price)
        ) {
            return res.status(400).json({ success: 0 });
        }

        req.body.sizes = checkSizesList(req.body.sizes);
        if (!req.body.sizes) {
            return res.status(400).json({ success: 0 });
        }

        req.body.price = parseInt(req.body.price);
        if (req.body.price < 1) {
            return res.status(400).json({ success: 0 });
        }

        await connection.beginTransaction();

        const [result, _] = await connection.query(
            'INSERT INTO products (line_id, class_id, name, price, description, thumbnail) VALUES (?,?,?,?,?,?)',
            [
                req.body.lineId,
                req.body.classId,
                req.body.name,
                req.body.price,
                req.body.description,
                req.body.thumbnail,
            ],
        );

        const productId = result.insertId;
        const query =
            'INSERT INTO product_has_size (product_id, size_id, quantity) VALUES ' +
            '(?,?,?),'.repeat(req.body.sizes.length).slice(0, -1);
        const params = req.body.sizes.reduce(
            (p, c) => p.concat([productId, c.sizeId, c.quantity]),
            [],
        );
        await connection.query(query, params);

        await connection.commit();
        return res.json({ success: 1 });
    } catch (error) {
        await connection.rollback();
        promisePool.releaseConnection();
        return next(createError(error));
    } finally {
        promisePool.releaseConnection();
    }
}

/**
 * productId
 * name
 * price
 * sizes: [sizeId,quantity]
 * description
 * thumbnail
 */
async function modifyProduct(req, res, next) {
    const connection = await promisePool.getConnection();
    try {
        if (!req.body.productId) {
            return res.status(400).json({ success: 0 });
        }

        let query = 'UPDATE products SET';
        let params = [];
        if (req.body.name) {
            query += ' name=?,';
            params.push(req.body.name);
        }
        if (req.body.price) {
            req.body.price = parseInt(req.body.price);
            if (req.body.price < 1) {
                return res.status(400).json({ success: 0 });
            }
            query += ' price=?,';
            params.push(req.body.price);
        }
        if (req.body.sizes) {
            req.body.sizes = checkSizesList(req.body.sizes);
            if (!req.body.sizes) {
                return res.status(400).json({ success: 0 });
            }
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

        await connection.beginTransaction();

        await connection.query(query, params);

        if (req.body.sizes) {
            await connection.query('DELETE FROM product_has_size WHERE product_id=?', [
                req.body.productId,
            ]);

            const query =
                'INSERT INTO product_has_size (product_id, size_id, quantity) VALUES ' +
                '(?,?,?),'.repeat(req.body.sizes.length).slice(0, -1);
            const params = req.body.sizes.reduce(
                (p, c) => p.concat([req.body.productId, c.sizeId, c.quantity]),
                [],
            );
            await connection.query(query, params);
        }

        await connection.commit();
        return res.json({ success: 1 });
    } catch (error) {
        await connection.rollback();
        promisePool.releaseConnection();
        return next(createError(error));
    } finally {
        promisePool.releaseConnection();
    }
}

/**
 * Not use.
 *
 * productId : body
 */
async function removeProduct(req, res, next) {
    try {
        if (!req.body.productId) {
            return res.status(400).json({ success: 0 });
        }

        await promisePool.query('DELETE FROM products WHERE product_id=?', [
            req.body.productId,
        ]);

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * type
 * classId
 * name
 */
async function addCategory(req, res, next) {
    try {
        if (!req.body.type || !req.body.name) {
            return res.status(400).json({ success: 0 });
        }

        let query, params;
        if (req.body.type === 'class') {
            query = 'INSERT INTO product_classes (name) VALUES (?)';
            params = [req.body.name];
        } else if (req.body.type === 'line') {
            if (!req.body.classId) {
                return res.status(400).json({ success: 0 });
            }

            query = 'INSERT INTO product_lines (class_id, name) VALUES (?,?)';
            params = [req.body.classId, req.body.name];
        } else {
            return res.status(400).json({ success: 0 });
        }

        await promisePool.query(query, params);
        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * begin : body
 * quantity : body
 */
async function getBills(req, res, next) {
    try {
        if (!req.body.begin || !req.body.quantity) {
            return res.status(400).json({ success: 0 });
        }

        req.body.begin = parseInt(req.body.begin);
        req.body.quantity = parseInt(req.body.quantity);

        const [rows, _] = await promisePool.query(
            'SELECT * FROM bills ORDER BY created_at DESC LIMIT ?,?',
            [req.body.begin, req.body.quantity],
        );

        res.json({ success: 1, results: rows });
    } catch (error) {
        return next(createError(error));
    }
}

function checkSizesList(sizes) {
    try {
        sizes = JSON.parse(sizes);
        if (!sizes.length) {
            return 0;
        }
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
    } catch (error) {
        throw error;
    }
}

module.exports = {
    addProduct,
    modifyProduct,
    removeProduct,
    addCategory,
    getBills,
};
