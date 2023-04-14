const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.MAILER_HOST,
    port: process.env.MAILER_PORT,
    secure: false,
    auth: {
        user: process.env.MAILER_SERVICE_EMAIL_ADDRESS,
        pass: process.env.MAILER_SERVICE_EMAIL_PASSWORD,
    },
});

function verificationEmailOptions(_to, _token) {
    return {
        from: `MyOnShopp <${process.env.MAILER_SERVICE_EMAIL_ADDRESS}>`,
        to: _to,
        subject: `Đây là thư xác minh tài khoản email của bạn.`,
        text: `Đây là thư xác minh tài khoản email của bạn.`,
        html: `<p>Nhấn vào <a href="${process.env.WEB_DOMAIN}/auth/signup/create-account?email=${_to}&token=${_token}">đường dẫn</a> này để xác nhận. Email này có hiệu lực trong 10 phút.</p>`,
    };
}

function resetPasswordEmailOptions(_to, _token) {
    return {
        from: `MyOnShopp <${process.env.MAILER_SERVICE_EMAIL_ADDRESS}>`,
        to: _to,
        subject: `Đây là thư đổi mật khẩu tài khoản Se20Shop của bạn.`,
        text: `Đây là thư đổi mật khẩu tài khoản Se20Shop của bạn.`,
        html: `<p>Nhấn vào <a href="${process.env.WEB_DOMAIN}/auth/reset-password?email=${_to}&token=${_token}">đường dẫn</a> này để thực hiện đổi mật khẩu. Email này có hiệu lực trong 10 phút.</p>`,
    };
}

function orderEmailOptions(_to, _id) {
    return {
        from: `MyOnShopp <${process.env.MAILER_SERVICE_EMAIL_ADDRESS}>`,
        to: _to,
        subject: `Xác nhận đơn hàng ${_id}.`,
        text: `Xác nhận đơn hàng ${_id}.`,
        html: `<p>Xem chi tiết tại <a href="${process.env.WEB_DOMAIN}/order/${_id}">đây</a>.</p>`,
    };
}

module.exports = {
    transporter,
    verificationEmailOptions,
    resetPasswordEmailOptions,
    orderEmailOptions,
};
