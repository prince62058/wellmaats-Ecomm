const jwt = require("jsonwebtoken");

function adminMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorised user!" });
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY"
    );
    if (decoded.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorised user!" });
  }
}

module.exports = adminMiddleware;
