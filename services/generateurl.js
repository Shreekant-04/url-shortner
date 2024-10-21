const crypto = require("crypto");

module.exports = genShortUrl = (url) => {
  let secretKey = process.env.SECRET_KET_HASH;
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(url);
  const hashedString = hmac.digest("hex");
  return hashedString.slice(0, 7);
};
