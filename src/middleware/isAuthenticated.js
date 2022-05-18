function isLoggedIn(req, res, next) {
  console.log(req.isAuthenticated());
  req.isAuthenticated() ? next() : res.sendStatus(401);
}

module.exports = isLoggedIn;
