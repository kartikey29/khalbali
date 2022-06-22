module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    oauthId: { type: DataTypes.STRING },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "userName must be unique",
      },
    },
    password: { type: DataTypes.STRING },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: "Email Already in use",
      },
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
