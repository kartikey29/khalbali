require("dotenv").config();

module.exports = {
  development: {
    HOST: process.env.HOST,
    DB: process.env.DB,
    USER: process.env.USER,
    PASSWORD: process.env.PASSWORD,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  production: {
    HOST: "34.131.148.215",
    DB: process.env.DB,
    USER: process.env.USER,
    PASSWORD: "idrdb@2006",
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      socketPath:
        "/cloudsql/esoteric-virtue-351813:asia-south2:khalbali-database",
    },
  },
};
