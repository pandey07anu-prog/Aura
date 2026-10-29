const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || '9a4f2c8d3b7a1e6f5c8b2d4e7a9c1f3b5e7d9a1c3e5b7d9a1c3e5b7d9a1c3e5b';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Authentication is required to access this resource',
      timestamp: new Date().toISOString()
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.sub || decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        status: 401,
        error: 'Unauthorized',
        message: 'Authentication is required to access this resource',
        timestamp: new Date().toISOString()
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        status: 403,
        error: 'Forbidden',
        message: 'Your account is currently suspended. Please contact administrator support.',
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      status: 401,
      error: 'Unauthorized',
      message: 'Authentication is required to access this resource',
      timestamp: new Date().toISOString()
    });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ROLE_ADMIN') {
    return res.status(403).json({
      success: false,
      status: 403,
      error: 'Forbidden',
      message: 'Access denied. Administrator privileges required',
      timestamp: new Date().toISOString()
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAdmin
};
