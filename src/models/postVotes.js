module.exports = (sequelize, DataTypes) => {
  const Vote = sequelize.define("votes", {
    vote_value: { type: DataTypes.INTEGER, allowNull: false },
  });

  return Vote;
};
