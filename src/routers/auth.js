const express = require("express");
const passport = require("passport");

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
  passport.authenticate("google", { failWithError: true }),
  function (req, res, next) {
    return res.json({ message: "Success", user: req.user });
  },
  function (err, req, res, next) {
    return res.json({ message: "Wrong username or password" });
  }
);

router.get("/failure", function (req, res) {
  res.send("unauthirized");
});
module.exports = router;

// {
//   successRedirect: '/users',
//   failureRedirect: '/auth/failure',
// }
