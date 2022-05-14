const jwt = require('jsonwebtoken');

function verifyTokenGET(req, res, next) {
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

function verifyTokenPOST(req, res, next) {
  const token = req.cookies['x-access-token'];
  if (!token) {
    return res.status(401).json({ success: 0, redirect: '/auth/login' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: 0, redirect: '/auth/login' });
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
  verifyTokenGET,
  verifyTokenPOST,
  isAdmin
}
