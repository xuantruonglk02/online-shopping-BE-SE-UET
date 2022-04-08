const jwt = require('jsonwebtoken');

function getUserId(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.userId;
}

function getCartId(token) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return decoded.cartId;
}

module.exports = {
  getUserId,
  getCartId
}
