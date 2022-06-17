const db = require("../db/index");
const Post = db.post;
const Subreddit = db.subreddit;
const Comment = db.comment;

const doPagination = async (page, limit, whereClause, search, type) => {
  let data;
  switch (type) {
    case "comments":
      data = await Comment.count({
        where: whereClause,
      });
      break;
    case "posts":
      data = await Post.count({
        where: search,
        include: [
          {
            model: Subreddit,
            attributes: [],
            where: whereClause,
          },
        ],
      });
      break;
    case "subreddits":
  }
  console.log(data);
  const pages = Math.ceil(data / limit);
  const offset = limit * (page - 1);
  return { pages, offset, count: data };
};
module.exports = doPagination;
