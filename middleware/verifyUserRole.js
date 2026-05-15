const jwt = require("jsonwebtoken");

const verifyUserRole = (allowedRoles) => {
  return (req, res, next) => {
    let token = null;

    // 1. Primary Check: Extract from standard Authorization Header
    const authHeader = req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } 
    // 2. Secondary Check: Fallback to server-side express-session storage if it exists
    else if (req.session?.user?.token) {
      token = req.session.user.token;
    }

    // Safety Catch: If no token was discovered through either vector
    if (!token) {
      return res.status(401).json({ 
        message: "Access denied. No authentication token provided." 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Safety Check: Verify that the account's role is included in the allowed clearances array
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          message: "Access denied. Insufficient permissions for this operation." 
        });
      }

      // Append the decoded token payload data to the request object for downstream controller use
      req.user = decoded;
      next();
    } catch (error) {
      console.error("Role Verification Token Error:", error.message);
      return res.status(401).json({ 
        message: error.name === "TokenExpiredError" ? "Token has expired" : "Invalid token validation" 
      });
    }
  };
};

module.exports = verifyUserRole;