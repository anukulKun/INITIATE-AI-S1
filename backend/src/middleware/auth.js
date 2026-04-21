const jwt = require("jsonwebtoken");
const config = require("../config");

function issueToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, walletAddress: user.wallet_address || null },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    req.user = jwt.verify(auth.slice(7), config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = { issueToken, requireAuth };