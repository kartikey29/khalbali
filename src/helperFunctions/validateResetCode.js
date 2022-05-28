const db = require("../db/index");
const { differenceInHours } = require("date-fns");
const User = db.user;

const validateResetCode = async (code = "") => {
  const [timeHash, reqUserHash] = code.split("-");

  const timestamp = Buffer.from(timeHash, "base64").toString("ascii");

  // If more than 24 hours, then fail
  const diff = differenceInHours(new Date(timestamp), new Date());

  if (Math.abs(diff) > 24) return false;

  // Get record from DB
  const user = await User.findOne({ where: { token: code } });
  console.log(user);
  // If nothing found, then bail
  if (!user) return false;
  return true;
};

module.exports = validateResetCode;
