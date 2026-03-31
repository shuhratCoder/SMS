const jwt = require("jsonwebtoken");

function authentication(req, res, next) {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Token topilmadi" });
    }
    const decoded = jwt.verify(token, process.env.secret);
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Tokenni mudati tugagan" });
  }
}
module.exports = authentication;
