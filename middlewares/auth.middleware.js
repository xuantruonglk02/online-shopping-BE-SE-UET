const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.cookies['x-access-token'];
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
  const token = req.cookies['x-access-token'];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect('/auth/login');
    }

    if (decoded.admin === 1) {
      next();
    } else {
      return res.redirect('/');
    }
  });
}

module.exports = {
  verifyToken,
  isAdmin
}
