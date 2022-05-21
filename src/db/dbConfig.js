require("dotenv").config();

module.exports = {
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
};
