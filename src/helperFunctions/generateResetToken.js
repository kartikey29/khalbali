const crypto = require("crypto");

function getUserString(user) {
  return `${user.id}${user.email}${user.password}${user.updatedAt}`;
}

function getUserHash(string) {
  return crypto.createHash("md5").update(string).digest("hex");
}

function generateResetCode(user) {
  // create ISO String
  const now = new Date();

  // Convert to Base64
  const timeHash = Buffer.from(now.toISOString()).toString("base64");

  // User string
  const userString = getUserString(user);
  const userHash = getUserHash(userString);

  return `${timeHash}-${userHash}`;
}

module.exports = generateResetCode;
