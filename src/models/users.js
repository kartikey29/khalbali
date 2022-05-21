module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    oauthId: { type: DataTypes.STRING },
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: "Must be a valid email address",
        },
      },
    },
    token: {
      type: DataTypes.STRING,
    },
  });
  return User;
};
