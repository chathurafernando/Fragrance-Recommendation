import jwt from "jsonwebtoken";

const authenticate = (roles = []) => {
    return (req, res, next) => {
      // Get token from Authorization header
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
      }
  
      // Verify the token
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid or expired token." });
        }
  
        // Attach the user info to the request object
        req.user = decoded;
  
        // If roles are provided, check if the user's role matches one of them
        if (roles.length && !roles.includes(decoded.role)) {
          return res.status(403).json({ message: "Access denied. Insufficient role." });
        }
  
        // Continue to the next middleware or route handler
        next();
      });
    };
  };
  
  export default authenticate;