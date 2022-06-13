const express = require("express");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const db = require("./db/index");
// After you declare "app"

const usersRouter = require("./routers/users");
const postsRouter = require("./routers/posts");
const subredditsRouter = require("./routers/subreddits");
const moderatorsRouter = require("./routers/moderators");
const commentsRouter = require("./routers/comments");
const votesRouter = require("./routers/votes");
const passport = require("passport");
const auth = require("./routers/auth");
const port = process.env.PORT || 5000;

const app = express();

app.use(cookieParser());
app.use(express.json());

//http://khalbali.herokuapp.com

// var whitelist = ["http://localhost:3000", "http://khalbali.herokuapp.com"];

// var corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
// };

var corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

app.use(passport.initialize());

app.use(express.urlencoded({ extended: false }));

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
