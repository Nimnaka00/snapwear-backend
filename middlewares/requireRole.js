// middlewares/requireRole.js
module.exports = function requireRole(role) {
  return (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });
      if (req.user.role !== role)
        return res.status(403).json({ message: "Forbidden" });
      next();
    } catch (e) {
      return res.status(500).json({ message: "Access check failed" });
    }
  };
};
