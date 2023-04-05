
function verifyTokenGET(req, res, next) {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  next();
}

function verifyTokenPOST(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: 0, redirect: "/auth/login" });
  }
  next();
}

function isAdmin(req, res, next) {
  if (req.session.admin === 1) {
    next();
  } else {
    return res.redirect("/");
  }
}

function verifyUserSession(req, res, next) {
  console.log(req.session);
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  next();
}

module.exports = {
  verifyTokenGET,
  verifyTokenPOST,
  isAdmin,
  verifyUserSession,
};
