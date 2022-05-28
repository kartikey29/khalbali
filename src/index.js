const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const db = require("./db/index");
// After you declare "app"

require("dotenv").config();
const usersRouter = require("./routers/users");
const postsRouter = require("./routers/posts");
const subredditsRouter = require("./routers/subreddits");
const moderatorsRouter = require("./routers/moderators");
const commentsRouter = require("./routers/comments");
const votesRouter = require("./routers/votes");
const passport = require("passport");
const auth = require("./routers/auth");
const port = process.env.PORT || 5000;

var sessionStore = new SequelizeStore({
  db: db.sequelize,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000,
});

const app = express();
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
    store: sessionStore,
  })
);

sessionStore.sync();
app.use(
  cors({
    origin: "http://localhost:3000", // allow to server to accept request from different origin
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true, // allow session cookie from browser to pass through
  })
);
app.use(cookieParser());
app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/subreddits", subredditsRouter);
app.use("/moderators", moderatorsRouter);
app.use("/comments", commentsRouter);
app.use("/votes", votesRouter);
app.use("/auth", auth);

//processes all api calls that doesnt exist

app.use((req, res) => {
  return res.status(500).send({ message: "this api route doesnt exist" });
});

app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
