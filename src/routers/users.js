const express = require("express");
const bcrypt = require("bcrypt");
const validateResetCode = require("../helperFunctions/validateResetCode");
const generateResetToken = require("../helperFunctions/generateResetToken");
const hashPassword = require("../helperFunctions/hashPassword");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/mailer");
require("../passport/passport");
const passport = require("passport");
const db = require("../db/index");
const hashpassword = require("../helperFunctions/hashPassword");
const router = express.Router();
const User = db.user;

router.get(
  "/getUserData",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    delete req.user.dataValues.password;
    res.send(req.user);
  }
);

//get data of all users
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const rows = await User.findAll();
      const data = rows.map((user) => {
        const values = {
          id: user.id,
          username: user.username,
          updatedAT: user.updatedAt,
          createdAt: user.createdAt,
        };
        return values;
      });

      res.send(data);
    } catch (e) {
      res.status(500).send({ error: e.message });
    }
  }
);

//get user by id

router.get(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res
          .status(404)
          .send({ error: "Could not find user with that id" });
      } else {
        const values = {
          id: user.id,
          username: user.username,
          updatedAT: user.updatedAt,
          createdAt: user.createdAt,
        };
        res.send(values);
      }
    } catch (e) {
      res.status(500).send({ error: e.message });
    }
  }
);

router.post("/login", (req, res, next) => {
  passport.authenticate(
    "local-login",
    { session: false },
    (err, users, info) => {
      if (err) {
        console.error(`error ${err}`);
      }
      if (info !== undefined) {
        console.error(info.message);
        if (info.message === "bad username") {
          res.status(401).send(info.message);
        } else {
          res.status(403).send(info.message);
        }
      } else {
        req.logIn(users, { session: false }, () => {
          User.findOne({
            where: {
              username: req.body.username,
            },
          }).then((user) => {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
              expiresIn: 604800,
            });
            delete user.dataValues.password;
            res.status(200).send({
              auth: true,
              token: `Bearer ${token}`,
              user,
              message: "user found & logged in",
            });
          });
        });
      }
    }
  )(req, res, next);
});

//register a new user

router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    console.log(req.body);

    if (!username || !password) {
      throw new Error("Username and password are required");
    }

    const selectUserStatement = await User.findOne({
      where: { username: username },
    });

    if (selectUserStatement) {
      return res.status(401).send({ error: "username taken" });
    }
    console.log(password);

    const userPass = await bcrypt.hash(password, 10);
    console.log(userPass);

    const user = await User.create({
      username,
      password: userPass,
      email: email,
    });

    res.send(user);
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

//logout

router.post("/logout", async (req, res) => {
  req.logout();
  res.send({ message: "logged out successfully" });
});

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      console.log(req.params.id);
      const { username, password } = req.body;
      if (!username) {
        throw new Error("Username is required");
      }
      if (!password) {
        throw new Error("Password is required");
      }

      const rows = await User.findOne({ where: { username: username } });

      if (rows != null) {
        return res.status(409).send({ error: "Username is already taken" });
      }

      const hashedpassword = await hashpassword(req.body.password);

      const updateUser = await User.update(
        { username: username, password: hashedpassword },
        { where: { id: req.params.id } }
      );
      if (updateUser) {
        res.send({ message: "username and password updated", username });
      } else {
        throw Error;
      }
    } catch (e) {
      res.status(404).send({ error: e.message });
    }
  }
);

//delete user using id

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const deleteUserStatement = await User.destroy({
        where: { id: req.params.id },
      });

      if (!deleteUserStatement) {
        return res
          .status(404)
          .send({ error: "Could not find user with that id" });
      }
      return res.send({
        message: "deleted",
      });
    } catch (e) {
      res.status(400).send({ error: e.message });
    }
  }
);

router.post("/forgetPass", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res
      .status(500)
      .send({ message: "User with this email is not registered !" });
  }
  const token = generateResetToken(user);
  user.token = token;
  await user.save();
  const isSent = await sendEmail(email, "Reset Password Link", "abc", token);
  if (!isSent) {
    return res.status(500).send({ message: "Email not sent" });
  }
  return res.send({ message: "email sent" });
});

router.post("/resetPass", async (req, res) => {
  const { newPassword, token } = req.body;
  console.log(token);
  const isValid = await validateResetCode(token);
  if (!isValid) {
    return res.status(500).send({ message: "token has expired" });
  }
  const hashedPassword = await hashPassword(newPassword);
  const user = await User.findOne({ where: { token } });
  user.password = hashedPassword;
  user.token = null;
  await user.save();
  return res.send({ message: "password reset successfully" });
});

module.exports = router;
