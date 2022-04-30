const Subreddit = require('./Subreddit')

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define('Post', {
    type: {
      type: DataTypes.ENUM('text', 'link'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.INTERGER,
      allowNull: false,
      references: {
        model: users,
        key: 'id',
      },
    },
    subbReddit_id: {
      type: DataTypes.INTERGER,
      allowNull: false,
      references: {
        model: Subreddit,
        key: 'id',
      },
    },
  })
  return Post
}