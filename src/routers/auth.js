const express = require("express");
const passport = require("passport");
const db = require("../db/index");
const User = db.user;
const jwt = require("jsonwebtoken");

const router = express.Router();
require("../passport/passport");

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    console.log(req.user);

    req.logIn(req.user, { session: false }, () => {
      User.findOne({
        where: {
          id: req.user.id,
        },
      }).then((user) => {
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
          expiresIn: 60 * 60,
        });
        delete user.dataValues.password;
        const query = new URLSearchParams({ token: token });
        res.redirect(process.env.REACT_APP_FRONTEND_URL + query);
      });
    });
  }
);

router.get("/failure", function (req, res) {
  res.send("unauthirized");
});
module.exports = router;
