const bcrypt = require("bcrypt");

const hashpassword = async (password) => {
  const hashedpassword = await bcrypt.hash(password, 10);
  return hashedpassword;
};

module.exports = hashpassword;
