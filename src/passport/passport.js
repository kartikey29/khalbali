const passport = require("passport");
require("dotenv").config();
var GoogleStrategy = require("passport-google-oauth2").Strategy;
var LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJWT = require("passport-jwt").ExtractJwt;
const AnonymousStrategy = require("passport-anonymous").Strategy;
const bcrypt = require("bcrypt");
const db = require("../db/index");
const User = db.user;

passport.use(new AnonymousStrategy());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.REACT_APP_BACKEND_URL}auth/google/callback`,
    },
    async function (request, accessToken, refreshToken, profile, done) {
      console.log(profile);
      const user = await User.findOne({ where: { oauthId: profile.id } });
      if (user) {
        return done(null, user);
      } else if (!user) {
        const userName = profile.email.split("@")[0];
        console.log(userName);
        const user = new User({
          oauthId: profile.id,
          username: userName,
          email: profile.email,
        });
        console.log(user);
        await user.save();
        return done(null, user);
      }
    }
  )
);

passport.use(
  "local-login",
  new LocalStrategy(
    {
      username: "username",
      password: "password",
      passReqToCallback: true,
    },
    function (req, username, password, done) {
      User.findOne({ where: { username: username } })
        .then(function (user) {
          if (!user) {
            return done(null, false, { message: "Incorrect username." });
          }
          const match = bcrypt.compareSync(password, user.password);
          if (!match) {
            return done(null, false, { message: "Incorrect password." });
          }
          delete user.dataValues.password;
          console.log(user);
          return done(null, user);
        })
        .catch((err) => done(err));
    }
  )
);

const opts = {
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

passport.use(
  "jwt",
  new JwtStrategy(opts, (jwt_payload, done) => {
    try {
      User.findOne({
        where: {
          id: jwt_payload.id,
        },
      }).then((user) => {
        if (user) {
          console.log("user found in db in passport");
          done(null, user);
        } else {
          console.log("user not found in db");
          done(null, false);
        }
      });
    } catch (err) {
      done(err);
    }
  })
);

passport.serializeUser(function (newUser, done) {
  done(null, newUser.id);
});

passport.deserializeUser(function (id, done) {
  User.findOne({
    where: { id: id },
  })
    .then((user) => done(null, user))
    .catch((error) => done(error, null));
});
