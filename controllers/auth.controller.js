const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const {
    transporter,
    verificationEmailOptions,
    resetPasswordEmailOptions,
} = require('../config/nodemailer.config');
const { connection } = require('../models/database');

/**
 * username : body
 * password : body
 */
function login(req, res) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({ success: 0 });
    }

    connection.query(
        'SELECT user_id, cart_id, password, admin FROM users WHERE ? IN (phone, email)',
        [req.body.username],
        async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: 0 });
            }

            if (!results.length) {
                return res.json({ success: 0, code: 'username' });
            }

            const match = await bcrypt.compare(
                req.body.password,
                results[0].password
            );
            if (!match) {
                return res.json({ success: 0, code: 'password' });
            }

            const token = jwt.sign(
                {
                    userId: results[0].user_id,
                    cartId: results[0].cart_id,
                    admin: results[0].admin,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: 24 * 60 * 60 * 1000,
                }
            );
            res.cookie('x-access-token', token, {
                maxAge: 24 * 60 * 60 * 1000,
                httpOnly: true,
            });
            res.json({ success: 1, redirect: '/', accessToken: token });
        }
    );
}

/**
 * email : body
 */
function registerEmail(req, res) {
    if (!req.body.email) {
        return res.status(400).json({ success: 0 });
    }
    if (!validator.isEmail(req.body.email)) {
        return res.json({ success: 0, code: 'invalid' });
    }

    connection.query(
        'SELECT COUNT(user_id) AS exist FROM users WHERE email=?',
        [req.body.email],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.json({ success: 0 });
            }
            if (results[0].exist) {
                return res.json({ success: 0, code: 'exist' });
            }

            crypto.randomBytes(30, (err, buffer) => {
                if (err) {
                    console.log(err);
                    return res.json({ success: 0 });
                }

                const token = buffer.toString('hex');
                transporter.sendMail(
                    verificationEmailOptions(req.body.email, token),
                    (err, info) => {
                        if (err) {
                            console.log(err);
                            return res.json({
                                success: 0,
                                code: 'email-sending-error',
                            });
                        }

                        connection.query(
                            'INSERT INTO verify_email (email, token) VALUES (?,?)',
                            [req.body.email, token],
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    return res.json({ success: 0 });
                                }

                                res.json({ success: 1 });
                            }
                        );
                    }
                );
            });
        }
    );
}

/**
 * name : body
 * email : body
 * phone : body
 * password : body
 * repassword : body
 * token : body
 */
function createAccount(req, res) {
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
        return res.json({ success: 0, code: 'repassword-wrong' });
    }
    if (!validator.isMobilePhone(req.body.phone, 'vi-VN')) {
        return res.json({ success: 0, code: 'phone-wrong' });
    }

    connection.query(
        'SELECT created_at FROM verify_email WHERE email=? AND token=?',
        [req.body.email, req.body.token],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ success: 0 });
            }

            if (!results.length) {
                return res.json({ success: 0, code: 'verify-not-exist' });
            }
            if (
                new Date() - new Date(results[0].created_at) >
                process.env.EMAIL_TOKEN_EXPIRATION_TIME
            ) {
                return res.json({ success: 0, code: 'verify-expired' });
            }

            connection.query(
                'SELECT COUNT(user_id) AS exist FROM users WHERE email=? OR phone=?',
                [req.body.email, req.body.phone],
                async (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: 0 });
                    }

                    if (results[0].exist) {
                        return res.json({
                            success: 0,
                            code: 'email-phone-exist',
                        });
                    }

                    const salt = await bcrypt.genSalt(12);
                    const hash = await bcrypt.hash(req.body.password, salt);

                    connection.query(
                        'INSERT INTO carts VALUES(DEFAULT, DEFAULT)',
                        (err, results) => {
                            if (err) {
                                console.log(err);
                                return res.status(500).json({ success: 0 });
                            }

                            const cartId = results.insertId;
                            connection.query(
                                'INSERT INTO users (cart_id, name, phone, email, password) VALUES (?,?,?,?,?)',
                                [
                                    cartId,
                                    req.body.name,
                                    req.body.phone,
                                    req.body.email,
                                    hash,
                                ],
                                (err, results) => {
                                    if (err) {
                                        console.log(err);
                                        return res
                                            .status(500)
                                            .json({ success: 0 });
                                    }

                                    const token = jwt.sign(
                                        {
                                            userId: results.insertId,
                                            cartId: cartId,
                                            admin: 0,
                                        },
                                        process.env.JWT_SECRET,
                                        {
                                            expiresIn: 60 * 60 * 24,
                                        }
                                    );
                                    res.cookie('x-access-token', token, {
                                        maxAge: 60 * 60 * 24,
                                        httpOnly: true,
                                    });
                                    res.json({
                                        success: 1,
                                        redirect: '/',
                                        accessToken: token,
                                    });

                                    connection.query(
                                        'DELETE FROM verify_email WHERE email=? AND token=?',
                                        [req.body.email, token],
                                        (err, results) => {}
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}

/**
 * email : body
 */
function forgetPassword(req, res) {
    if (!req.body.email) {
        return res.status(400).json({ success: 0 });
    }
    if (!validator.isEmail(req.body.email)) {
        return res.json({ success: 0, code: 'invalid' });
    }

    connection.query(
        'SELECT user_id FROM users WHERE email=?',
        [req.body.email],
        (err, results) => {
            if (err) {
                console.log(err);
                return res.json({ success: 0 });
            }
            if (results.length == 0) {
                return res.json({ succes: 0, code: 'email-not-exist' });
            }

            const userId = results[0].user_id;

            crypto.randomBytes(30, (err, buffer) => {
                if (err) {
                    console.log(err);
                    return res.json({ success: 0 });
                }

                const token = buffer.toString('hex');
                transporter.sendMail(
                    resetPasswordEmailOptions(req.body.email, token),
                    (err, info) => {
                        if (err) {
                            console.log(err);
                            return res.json({
                                success: 0,
                                code: 'email-sending-error',
                            });
                        }

                        connection.query(
                            'INSERT INTO reset_password_token (user_id, email, token) VALUES (?,?,?)',
                            [userId, req.body.email, 0, token],
                            (err, results) => {
                                if (err) {
                                    console.log(err);
                                    return res.json({ success: 0 });
                                }

                                res.json({ success: 1 });
                            }
                        );
                    }
                );
            });
        }
    );
}

/**
 * email : body
 * password : body
 * repassword : body
 * token : body
 */
function resetPassword(req, res) {
    if (
        !req.body.email ||
        !req.body.password ||
        !req.body.repassword ||
        !req.body.token
    ) {
        res.status(400).json({ success: 0 });
    }
    if (req.body.password !== req.body.repassword) {
        return res.json({ success: 0, code: 'repassword-wrong' });
    }

    connection.query(
        'SELECT user_id, created_at FROM reset_password_token WHERE email=? AND token=?',
        [req.body.email, req.body.token],
        async (err, results) => {
            if (err) {
                console.log(err);
                return res.json({ success: 0 });
            }
            if (!results.length) {
                return res.json({ success: 0, code: 'token-not-exist' });
            }
            if (
                new Date() - new Date(results[0].created_at) >
                process.env.RESET_PASSWORD_TOKEN_EXPIRATION_TIME
            ) {
                return res.json({ success: 0, code: 'token-expired' });
            }

            const userId = results[0].user_id;
            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash(req.body.password, salt);
            connection.query(
                'UPDATE users SET password=? WHERE user_id=?',
                [hash, userId],
                (err, results) => {
                    if (err) {
                        console.log(err);
                        return res.json({ success: 0 });
                    }

                    res.json({ success: 1 });

                    connection.query(
                        'DELETE FROM reset_password_token WHERE user_id=? AND email=? AND token=?',
                        [userId, req.body.email, req.body.token],
                        (err, results) => {}
                    );
                }
            );
        }
    );
}

module.exports = {
    login,
    registerEmail,
    createAccount,
    forgetPassword,
    resetPassword,
};
