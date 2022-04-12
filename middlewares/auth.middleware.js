const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['x-access-token'];
  if (!token) {
    return res.redirect('/auth/login');
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/auth/login');
    }

    next();
  });
}

function isAdmin(req, res, next) {
  const token = req.headers['x-access-token'];
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/auth/login');
    }
    if (decoded.role !== 'admin') {
      return res.redirect('/');
    }

    next();
  });
}

module.exports = {
  verifyToken,
  isAdmin
}
