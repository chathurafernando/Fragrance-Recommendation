import jwt from "jsonwebtoken";

// Token verification middleware
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(403).json("Token is required.");
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) {
      return res.status(403).json("Invalid or expired token.");
    }

    req.userInfo = userInfo;  // Attach userInfo (including id and role) to the request
    next();  // Proceed to the next middleware or route handler
  });
};
export const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.userInfo.role !== "admin") {
        return res.status(403).json("Access denied. Admins only.");
      }
      next();
    });
  };
// Role-based access control middleware
export const verifyRole = (role) => {
  return (req, res, next) => {
    const { role: userRole } = req.userInfo; // Get user role from the token

    if (userRole !== role) {
      return res.status(403).json("Access denied, insufficient role.");
    }

    next(); // User has the right role, proceed
  };
};
