const jwt = require('jsonwebtoken');
const { JWT_CONFIG } = require('../config/constants');

/**
 * Middleware to authenticate JWT tokens
 * Allows anonymous access but populates req.user if token is valid
 */
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  const token = auth && auth.split(' ')[1];
  
  if (!token) {
    // Allow anonymous access
    return next();
  }

  jwt.verify(token, JWT_CONFIG.SECRET, (err, user) => {
    if (err) {
      // Invalid token, but don't block the request
      return next();
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware to require authentication
 * Blocks requests without valid tokens
 */
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

module.exports = {
  authenticateToken,
  requireAuth
};
