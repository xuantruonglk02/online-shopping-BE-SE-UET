const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');
const createError = require('http-errors');
const {
    transporter,
    verificationEmailOptions,
    resetPasswordEmailOptions,
} = require('../services/nodemailer.service');
const { promisePool } = require('../models/database');

/**
 * username : body
 * password : body
 */
async function login(req, res, next) {
    try {
        if (!req.body.username || !req.body.password) {
            return res.status(400).json({ success: 0 });
        }

        const [rows, fields] = await promisePool.query(
            'SELECT user_id, password, admin FROM users WHERE ? IN (phone, email)',
            [req.body.username],
        );

        if (!rows.length) {
            return res.status(401).json({ success: 0, code: 'username' });
        }

        const match = await bcrypt.compare(req.body.password, rows?.[0].password);
        if (!match) {
            return res.status(401).json({ success: 0, code: 'password' });
        }

        req.session.userId = rows?.[0].user_id;
        req.session.admin = rows?.[0].admin;
        res.json({ success: 1, redirect: '/' });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * email : body
 */
async function registerEmail(req, res, next) {
    try {
        if (!req.body.email) {
            return res.status(400).json({ success: 0 });
        }
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ success: 0, code: 'invalid' });
        }

        const [rows, fields] = await promisePool.query(
            'SELECT COUNT(user_id) AS exist FROM users WHERE email=?',
            [req.body.email],
        );
        if (rows?.[0]?.exist) {
            return res.status(409).json({ success: 0, code: 'exist' });
        }

        const buffer = crypto.randomBytes(30);
        const token = buffer.toString('hex');
        await transporter.sendMail(verificationEmailOptions(req.body.email, token));

        await promisePool.query('INSERT INTO verify_email (email, token) VALUES (?,?)', [
            req.body.email,
            token,
        ]);

        return res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * name : body
 * email : body
 * phone : body
 * password : body
 * repassword : body
 * token : body
 */
async function createAccount(req, res, next) {
    try {
        if (
            !req.body.name ||
            !req.body.email ||
            !req.body.phone ||
            !req.body.password ||
            !req.body.repassword ||
            !req.body.token
        ) {
            return res.status(400).json({ success: 0 });
        }
        if (req.body.password !== req.body.repassword) {
            return res.status(400).json({ success: 0, code: 'repassword-wrong' });
        }
        if (!validator.isMobilePhone(req.body.phone, 'vi-VN')) {
            return res.status(400).json({ success: 0, code: 'phone-wrong' });
        }

        const [rows, fields] = await promisePool.query(
            'SELECT COUNT(user_id) AS exist FROM users WHERE email=? OR phone=?',
            [req.body.email, req.body.phone],
        );
        if (rows?.[0]?.exist) {
            return res.status(409).json({
                success: 0,
                code: 'email-phone-exist',
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(req.body.password, salt);

        await promisePool.query(
            'INSERT INTO users (name, phone, email, password) VALUES (?,?,?,?)',
            [req.body.name, req.body.phone, req.body.email, hash],
        );

        promisePool.query('DELETE FROM verify_email WHERE email=? AND token=?', [
            req.body.email,
            token,
        ]);

        return res.json({
            success: 1,
            redirect: '/',
        });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * email : body
 */
async function forgetPassword(req, res, next) {
    try {
        if (!req.body.email) {
            return res.status(400).json({ success: 0 });
        }
        if (!validator.isEmail(req.body.email)) {
            return res.status(400).json({ success: 0, code: 'invalid' });
        }

        const [rows, fields] = await promisePool.query(
            'SELECT user_id FROM users WHERE email=?',
            [req.body.email],
        );
        if (!rows.length) {
            return res.status(404).json({ succes: 0, code: 'email-not-exist' });
        }

        const userId = rows?.[0]?.user_id;
        const buffer = crypto.randomBytes(30);
        const token = buffer.toString('hex');
        await transporter.sendMail(resetPasswordEmailOptions(req.body.email, token));

        await promisePool.query(
            'INSERT INTO reset_password_token (user_id, email, token) VALUES (?,?,?)',
            [userId, req.body.email, 0, token],
        );

        return res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

/**
 * email : body
 * password : body
 * repassword : body
 * token : body
 */
async function resetPassword(req, res, next) {
    try {
        if (
            !req.body.email ||
            !req.body.password ||
            !req.body.repassword ||
            !req.body.token
        ) {
            res.status(400).json({ success: 0 });
        }
        if (req.body.password !== req.body.repassword) {
            return res.status(400).json({ success: 0, code: 'repassword-wrong' });
        }

        const [rows, fields] = await promisePool.query(
            'SELECT user_id, created_at FROM reset_password_token WHERE email=? AND token=?',
            [req.body.email, req.body.token],
        );
        if (!rows.length) {
            return res.status(400).json({ success: 0, code: 'token-not-exist' });
        }
        if (
            new Date() - new Date(rows[0].created_at) >
            process.env.RESET_PASSWORD_TOKEN_EXPIRATION_TIME
        ) {
            return res.status(400).json({ success: 0, code: 'token-expired' });
        }

        const userId = rows[0].user_id;
        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(req.body.password, salt);
        await promisePool.query('UPDATE users SET password=? WHERE user_id=?', [
            hash,
            userId,
        ]);

        promisePool.query(
            'DELETE FROM reset_password_token WHERE user_id=? AND email=? AND token=?',
            [userId, req.body.email, req.body.token],
        );

        res.json({ success: 1 });
    } catch (error) {
        return next(createError(error));
    }
}

module.exports = {
    login,
    registerEmail,
    createAccount,
    forgetPassword,
    resetPassword,
};
