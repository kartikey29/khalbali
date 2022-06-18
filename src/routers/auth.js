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
          expiresIn: 604800,
        });
        delete user.dataValues.password;
        res.redirect(process.env.REACT_APP_FRONTEND_URL + "token/" + token);
      });
    });
  }
);

router.get("/failure", function (req, res) {
  res.send("unauthirized");
});
module.exports = router;
