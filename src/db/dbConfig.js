require("dotenv").config();

module.exports = {
  development: {
    HOST: process.env.HOST,
    DB: process.env.DB,
    USER: process.env.mySqlUser,
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
    HOST: `/cloudsql/${process.env.DB_INSTANCE}`,
    DB: process.env.DB_NAME,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      socketPath: `/cloudsql/${process.env.DB_INSTANCE}`,
    },
  },
};
