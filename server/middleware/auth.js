import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes - verify JWT token from HTTP-only cookie or Bearer header
export const protect = async (req, res, next) => {
  let token;

  // 1. Check HTTP-Only Cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback to Authorization Header if provided
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, session token missing'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_jwt_secret_dev_key'
    );

    // Get user from the token (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user profile not found'
      });
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid session token'
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
