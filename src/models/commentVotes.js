module.exports = (sequelize, DataTypes) => {
  const CommentVotes = sequelize.define("commentvote", {
    vote_value: { type: DataTypes.INTEGER, allowNull: false },
  });

  return CommentVotes;
};
