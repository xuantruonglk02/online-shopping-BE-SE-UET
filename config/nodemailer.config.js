const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  ignoreTLS: true,
  auth: {
    user: process.env.SERVICE_EMAIL_ADDRESS,
    pass: process.env.SERVICE_EMAIL_PASSWORD
  }
});

function verificationEmailOptions(_to, _token) {
  return {
    from: `MyOnShopp <${process.env.SERVICE_EMAIL_ADDRESS}>`,
    to: _to,
    subject: `Đây là thư xác minh tài khoản email của bạn.`,
    text: `Đây là thư xác minh tài khoản email của bạn.`,
    html: `<p>Nhấn vào <a href="http://${process.env.WEB_DOMAIN}/auth/signup/create-account?email=${_to}&token=${_token}">đường dẫn</a> này để xác nhận.</p>`
  }
}

function orderEmailOptions(_to, _id) {
  return {
    from: `MyOnShopp <${process.env.SERVICE_EMAIL_ADDRESS}>`,
    to: _to,
    subject: `Xác nhận đơn hàng ${_id}.`,
    text: `Xác nhận đơn hàng ${_id}.`,
    html: `<p>Xem chi tiết tại <a href="http://${process.env.WEB_DOMAIN}/order/${_id}">đây</a>.</p>`
  }
}

module.exports = {
  transporter,
  verificationEmailOptions,
  orderEmailOptions
}
