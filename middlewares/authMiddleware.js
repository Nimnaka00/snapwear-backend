const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // now you can access `req.user` in any protected route
    next();
  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};

module.exports = authMiddleware;
