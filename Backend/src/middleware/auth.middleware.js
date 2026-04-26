import jwt from 'jsonwebtoken'
import userModel from '../models/user.model.js'

export async function authMiddleware(req, res, next) {
  try {
    let token;

    // 1. Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2. Cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. Body (least preferred — avoid in production if possible)
    if (!token && req.body?.token) {
      token = req.body.token;
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Access token expired", code: "TOKEN_EXPIRED" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }

    const user = await userModel.findById(decoded.id).select("-password -refreshToken");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
}