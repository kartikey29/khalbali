const db = require("../db/index");
const Post = db.post;
const Subreddit = db.subreddit;

const doPagination = async (page, limit, whereClause, search) => {
  const data = await Post.findAndCountAll({
    where: search,
    include: [
      {
        model: Subreddit,
        attributes: [],
        where: whereClause,
      },
    ],
  });

  const pages = Math.ceil(data.count / limit);
  const offset = limit * (page - 1);
  return { pages, offset, count: data.count };
};
module.exports = doPagination;
