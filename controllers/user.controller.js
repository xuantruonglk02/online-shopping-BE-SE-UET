const jwt = require('jsonwebtoken');

exports.getUserId = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
}

exports.getCartId = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.cartId;
}

