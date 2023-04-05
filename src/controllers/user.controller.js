const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validator = require('validator');

const { connection } = require('../models/database');

function getUserInformation(req, callback) {
    const userId = req.session.userId;
    connection.query(
        'SELECT name, phone, email, address FROM users WHERE user_id=?',
        [userId],
        (err, results) => {
            if (err) {
                return callback(err, null);
            }

            callback(null, results[0]);
        },
    );
}

function getUserInformationForCheckout(req, callback) {
    const userId = req.session.userId;
    connection.query(
        'SELECT name, phone, address FROM users WHERE user_id=?',
        [userId],
        (err, results) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, results[0]);
        },
    );
}

/**
 * name : body
 * password : body
 */
function changeName(req, res) {
    if (!req.body.name || !req.body.password) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    connection.query(
        'SELECT password FROM users WHERE user_id=?',
        [userId],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, error: err.code });
            }
            const match = await bcrypt.compare(req.body.password, results[0].password);
            if (!match) {
                return res.json({ success: 0, code: 'password-incorrect' });
            }

            connection.query(
                'UPDATE users SET name=? WHERE user_id=?',
                [req.body.name, userId],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ success: 0, error: err.code });
                    }

                    res.json({ success: 1 });
                },
            );
        },
    );
}

/**
 * email : body
 * password : body
 */
function changeEmail(req, res) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({ success: 0 });
    }
    if (!validator.isEmail(req.body.email)) {
        return res.json({ success: 0, msg: 'Email không hợp lệ' });
    }

    const userId = req.session.userId;
    connection.query(
        'SELECT password FROM users WHERE user_id=?',
        [userId],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, error: err.code });
            }

            const match = await bcrypt.compare(req.body.password, results[0].password);
            if (!match) {
                return res.json({
                    success: 0,
                    msg: 'Mật khẩu không chính xác',
                });
            }

            connection.query(
                'SELECT COUNT(user_id) AS exist FROM users WHERE email=?',
                [req.body.email],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ success: 0, error: err.code });
                    }

                    if (results[0].exist) {
                        return res.json({
                            success: 0,
                            msg: 'Email đã tồn tại',
                        });
                    }

                    connection.query(
                        'UPDATE users SET email=? WHERE user_id=?',
                        [req.body.email, userId],
                        (err, results) => {
                            if (err) {
                                return res.status(500).json({
                                    success: 0,
                                    error: err.code,
                                });
                            }

                            res.json({ success: 1 });
                        },
                    );
                },
            );
        },
    );
}

/**
 * phone : body
 * password : body
 */
function changePhone(req, res) {
    if (!req.body.phone || !req.body.password) {
        return res.status(400).json({ success: 0 });
    }
    if (!validator.isMobilePhone(req.body.phone, 'vi-VN')) {
        return res.json({ success: 0, msg: 'Số điện thoại không hợp lệ' });
    }

    const userId = req.session.userId;
    connection.query(
        'SELECT password FROM users WHERE user_id=?',
        [userId],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, error: err.code });
            }

            const match = await bcrypt.compare(req.body.password, results[0].password);
            if (!match) {
                return res.json({
                    success: 0,
                    msg: 'Mật khẩu không chính xác',
                });
            }

            connection.query(
                'SELECT COUNT(user_id) AS exist FROM users WHERE phone=?',
                [req.body.phone],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ success: 0, error: err.code });
                    }

                    if (results[0].exist) {
                        return res.json({
                            success: 0,
                            msg: 'Số điện thoại đã tồn tại',
                        });
                    }

                    connection.query(
                        'UPDATE users SET phone=? WHERE user_id=?',
                        [req.body.phone, userId],
                        (err, results) => {
                            if (err) {
                                return res.status(500).json({
                                    success: 0,
                                    error: err.code,
                                });
                            }

                            res.json({ success: 1 });
                        },
                    );
                },
            );
        },
    );
}

/**
 * address : body
 * password : body
 */
function changeAddress(req, res) {
    if (!req.body.address || !req.body.password) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    connection.query(
        'SELECT password FROM users WHERE user_id=?',
        [userId],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, error: err.code });
            }

            const match = await bcrypt.compare(req.body.password, results[0].password);
            if (!match) {
                return res.json({
                    success: 0,
                    msg: 'Mật khẩu không chính xác',
                });
            }

            connection.query(
                'UPDATE users SET address=? WHERE user_id=?',
                [req.body.address, userId],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ success: 0, error: err.code });
                    }

                    res.json({ success: 1 });
                },
            );
        },
    );
}

/**
 * oldPassword : body
 * newPassword : body
 */
function changePassword(req, res) {
    if (!req.body.oldPassword || !req.body.newPassword) {
        return res.status(400).json({ success: 0 });
    }

    const userId = req.session.userId;
    connection.query(
        'SELECT password FROM users WHERE user_id=?',
        [userId],
        async (err, results) => {
            if (err) {
                return res.status(500).json({ success: 0, error: err.code });
            }

            const matchOldPassword = await bcrypt.compare(
                req.body.oldPassword,
                results[0].password,
            );
            if (!matchOldPassword) {
                return res.json({
                    success: 0,
                    msg: 'Mật khẩu không chính xác',
                });
            }
            const matchNewPassword = await bcrypt.compare(
                req.body.newPassword,
                results[0].password,
            );
            if (matchNewPassword) {
                return res.json({
                    success: 0,
                    msg: 'Mật khẩu mới không được giống mật khẩu hiện tại',
                });
            }

            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash(req.body.newPassword, salt);

            connection.query(
                'UPDATE users SET password=? WHERE user_id=?',
                [hash, userId],
                (err, results) => {
                    if (err) {
                        return res.status(500).json({ success: 0, error: err.code });
                    }

                    res.json({ success: 1 });
                },
            );
        },
    );
}

module.exports = {
    getUserInformation,
    getUserInformationForCheckout,
    changeName,
    changeEmail,
    changePhone,
    changeAddress,
    changePassword,
};
