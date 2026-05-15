const jwt = require("jsonwebtoken");

const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Access Denied. Administrative token missing." });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the user has an admin flag in their JWT payload token
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: "Access Denied. Unauthorized clearance profile." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token authorization signature." });
  }
};

module.exports = verifyAdmin;