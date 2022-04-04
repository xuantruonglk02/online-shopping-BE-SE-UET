const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.SERVICE_EMAIL_ADDRESS,
    pass: process.env.SERVICE_EMAIL_PASSWORD
  }
});

exports.verificationEmailOptions = function (_to, _token) {
  return {
    from: `MyOnShopp <${process.env.SERVICE_EMAIL_ADDRESS}>`,
    to: _to,
    subject: `Đây là thư xác minh tài khoản email của bạn.`,
    text: `Đây là thư xác minh tài khoản email của bạn.`,
    html: `<p>Nhấn vào <a href="http://localhost:3000/auth/signup/create-account/${_token}">đường dẫn</a> này để xác nhận.</p>`
  }
}

exports.orderEmailOptions = function (_to, _id) {
  return {
    from: `MyOnShopp <${process.env.SERVICE_EMAIL_ADDRESS}>`,
    to: _to,
    subject: `Xác nhận đơn hàng ${_id}.`,
    text: `Xác nhận đơn hàng ${_id}.`,
    html: `<p>Xem chi tiết tại <a href="http://localhost:3000/order/${_id}">đây</a>.</p>`
  }
}

exports.sendMail = (options, cb) => {
  transporter.sendMail(options, (err, data) => {
    if (err) {
      return cb(err, null);
    } else {
      return cb(null, data);
    }
  });
}
