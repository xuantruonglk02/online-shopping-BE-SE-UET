const bcrypt = require('bcrypt');
const validator = require('validator');
const createError = require('http-errors');
const { promisePool } = require('../models/database');

async function getUserInformation(req, res, next) {
    try {
        // TODO: must use execute
        const userId = req.session.userId;
        const [rows, fields] = await promisePool.query(
            'SELECT name, phone, email, address FROM users WHERE user_id=?',
            [userId],
        );
        res.json({ success: 1, result: rows?.[0] });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * name : body
 * password : body
 */
async function changeName(req, res, next) {
    try {
        if (!req.body.name || !req.body.password) {
            return res.status(400).json({ success: 0 });
        }

        // TODO: must use execute
        const userId = req.session.userId;
        const [rows, fields] = await promisePool.query(
            'SELECT password FROM users WHERE user_id=?',
            [userId],
        );

        const match = await bcrypt.compare(req.body.password, rows?.[0].password);
        if (!match) {
            return res.status(401).json({ success: 0, code: 'password-incorrect' });
        }

        await promisePool.query('UPDATE users SET name=? WHERE user_id=?', [
            req.body.name,
            userId,
        ]);

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * email : body
 * password : body
 */
async function changeEmail(req, res, next) {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ success: 0 });
        }
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ success: 0, msg: 'Email không hợp lệ' });
        }

        const userId = req.session.userId;
        const [rows, fields] = await promisePool.query(
            'SELECT password FROM users WHERE user_id=?',
            [userId],
        );

        const match = await bcrypt.compare(req.body.password, rows?.[0].password);
        if (!match) {
            return res.status(401).json({ success: 0, code: 'password-incorrect' });
        }

        const [users, _] = await promisePool.query(
            'SELECT COUNT(user_id) AS exist FROM users WHERE email=?',
            [req.body.email],
        );
        if (users?.[0]?.exist) {
            return res.status(409).json({
                success: 0,
                msg: 'Email đã tồn tại',
            });
        }

        await promisePool.query('UPDATE users SET email=? WHERE user_id=?', [
            req.body.email,
            userId,
        ]);

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * phone : body
 * password : body
 */
async function changePhone(req, res, next) {
    try {
        if (!req.body.phone || !req.body.password) {
            return res.status(400).json({ success: 0 });
        }
        if (!validator.isMobilePhone(req.body.phone, 'vi-VN')) {
            return res.json({ success: 0, msg: 'Số điện thoại không hợp lệ' });
        }

        const userId = req.session.userId;
        const [rows, fields] = await promisePool.query(
            'SELECT password FROM users WHERE user_id=?',
            [userId],
        );

        const match = await bcrypt.compare(req.body.password, rows?.[0].password);
        if (!match) {
            return res.status(401).json({ success: 0, code: 'password-incorrect' });
        }

        const [users, _] = await promisePool.query(
            'SELECT COUNT(user_id) AS exist FROM users WHERE phone=?',
            [req.body.phone],
        );
        if (users?.[0]?.exist) {
            return res.status(409).json({
                success: 0,
                msg: 'Số điện thoại đã tồn tại',
            });
        }

        await promisePool.query('UPDATE users SET phone=? WHERE user_id=?', [
            req.body.phone,
            userId,
        ]);

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * address : body
 * password : body
 */
async function changeAddress(req, res, next) {
    try {
        if (!req.body.address || !req.body.password) {
            return res.status(400).json({ success: 0 });
        }

        const userId = req.session.userId;
        const [rows, fields] = await promisePool.query(
            'SELECT password FROM users WHERE user_id=?',
            [userId],
        );

        const match = await bcrypt.compare(req.body.password, rows?.[0].password);
        if (!match) {
            return res.status(401).json({ success: 0, code: 'password-incorrect' });
        }

        await promisePool.query('UPDATE users SET address=? WHERE user_id=?', [
            req.body.address,
            userId,
        ]);

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * oldPassword : body
 * newPassword : body
 */
async function changePassword(req, res, next) {
    try {
        if (!req.body.oldPassword || !req.body.newPassword) {
            return res.status(400).json({ success: 0 });
        }

        const userId = req.session.userId;
        const [rows, fields] = await promisePool.query(
            'SELECT password FROM users WHERE user_id=?',
            [userId],
        );

        const matchOldPassword = await bcrypt.compare(
            req.body.oldPassword,
            rows?.[0].password,
        );
        if (!matchOldPassword) {
            return res.json({
                success: 0,
                msg: 'Mật khẩu không chính xác',
            });
        }
        const matchNewPassword = await bcrypt.compare(
            req.body.newPassword,
            rows?.[0].password,
        );
        if (matchNewPassword) {
            return res.json({
                success: 0,
                msg: 'Mật khẩu mới không được giống mật khẩu hiện tại',
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(req.body.newPassword, salt);

        await promisePool.query('UPDATE users SET password=? WHERE user_id=?', [
            hash,
            userId,
        ]);

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

module.exports = {
    getUserInformation,
    changeName,
    changeEmail,
    changePhone,
    changeAddress,
    changePassword,
};
