const createError = require('http-errors');
const { promisePool } = require('../models/database');

/**
 * userName : body
 * userPhone : body
 * userAddress : body
 * list: [{productId,sizeId,quantity}] : body
 */
async function checkout(req, res, next) {
    const connection = await promisePool.getConnection();
    try {
        if (!req.body.userName || !req.body.userPhone || !req.body.userAddress) {
            return res.status(400).json({ success: 0, code: 'not-infor' });
        }
        if (!req.body.list) {
            return res.status(400).json({ success: 0 });
        }
        try {
            req.body.list = JSON.parse(req.body.list);
        } catch (error) {
            return res.status(400).json({ success: 0 });
        }
        if (!req.body.list.length) {
            return res.status(400).json({ success: 0 });
        }
        for (let i = 0; i < req.body.list.length; i++) {
            if (
                !req.body.list[i].productId ||
                !req.body.list[i].sizeId ||
                isNaN(req.body.list[i].quantity)
            ) {
                return res.status(400).json({ success: 0 });
            }
            req.body.list[i].quantity = parseInt(req.body.list[i].quantity);
            if (req.body.list[i].quantity < 1) {
                return res.status(400).json({ success: 0 });
            }
        }

        await connection.beginTransaction();

        const query1 =
            'SELECT product_id, size_id FROM product_has_size WHERE' +
            ' (product_id=? AND size_id=? AND quantity<?) OR'
                .repeat(req.body.list.length)
                .slice(0, -3);
        const params1 = req.body.list.reduce(
            (p, c) => p.concat([c.productId, c.sizeId, c.quantity]),
            [],
        );
        const [rows, fields] = await connection.query(query1, params1);
        if (rows.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                success: 0,
                code: 'not-enough',
                list: results,
            });
        }

        const userId = req.session.userId;
        const billId = new Date().getTime();
        await connection.query(
            'INSERT INTO bills (bill_id, user_id, user_name, user_phone, user_address) VALUES (?,?,?,?,?)',
            [billId, userId, req.body.userName, req.body.userPhone, req.body.userAddress],
        );

        const query2 =
            'INSERT INTO bill_has_product (bill_id, product_id, size_id, quantity) VALUES' +
            ' (?,?,?,?),'.repeat(req.body.list.length).slice(0, -1);
        const params2 = req.body.list.reduce(
            (p, c) => p.concat([billId, c.productId, c.sizeId, c.quantity]),
            [],
        );
        await connection.query(query2, params2);

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

module.exports = {
    checkout,
};
