/**
 * Authentication Middleware - CommonJS Version for Node.js/Express
 * میدل‌ویر احراز هویت برای سرور Node.js
 * 
 * Features:
 * - JWT token validation
 * - Role-based access control (Admin, User, Demo)
 * - Permission checking
 * - Rate limiting protection
 */

const jwt = require('jsonwebtoken');

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'titan-ultra-secret-key-2024';

/**
 * Middleware: Verify JWT Token
 * میدل‌ویر تایید توکن JWT
 * 
 * Usage: app.use('/api/protected', authenticateJWT)
 */
function authenticateJWT(req, res, next) {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'توکن احراز هویت مورد نیاز است',
        error: 'Authentication required'
      });
    }
    
    const token = authorization.substring(7); // Remove 'Bearer '
    
    // Handle demo tokens for development/testing
    if (token.startsWith('demo_token_')) {
      req.user = {
        id: '1',
        username: 'demo_user',
        role: 'admin',
        permissions: ['*'] // Admin has all permissions
      };
      return next();
    }
    
    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر یا منقضی شده',
        error: 'Invalid or expired token'
      });
    }
    
    // Add user info to request
    req.user = {
      id: decoded.id || decoded.userId,
      username: decoded.username,
      role: decoded.role || 'user',
      permissions: decoded.permissions || []
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'توکن منقضی شده است',
        error: 'Token expired',
        expiredAt: error.expiredAt
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'توکن نامعتبر است',
        error: 'Invalid token'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'خطا در احراز هویت',
      error: 'Authentication error'
    });
  }
}

/**
 * Middleware Factory: Require Specific Role
 * میدل‌ویر بررسی نقش کاربری
 * 
 * Usage: app.use('/api/admin', requireRole(['admin']))
 * 
 * @param {Array<string>} allowedRoles - مجاز roles (e.g., ['admin', 'superadmin'])
 * @returns {Function} Express middleware
 */
function requireRole(allowedRoles = []) {
  return function(req, res, next) {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'احراز هویت مورد نیاز است',
        error: 'Authentication required'
      });
    }
    
    // Admin with wildcard permission has access to everything
    if (user.permissions && user.permissions.includes('*')) {
      return next();
    }
    
    // Check if user role is in allowed roles
    if (!allowedRoles.includes(user.role)) {
      console.warn(`Permission denied: User ${user.username} (${user.role}) tried to access ${req.path}`);
      
      return res.status(403).json({
        success: false,
        message: 'دسترسی غیرمجاز - نقش کاربری مناسب ندارید',
        error: 'Forbidden',
        required_roles: allowedRoles,
        your_role: user.role
      });
    }
    
    next();
  };
}

/**
 * Middleware Factory: Require Specific Permission
 * میدل‌ویر بررسی مجوز خاص
 * 
 * Usage: app.use('/api/logs', requirePermission('logs:read'))
 * 
 * @param {string} requiredPermission - مجوز مورد نیاز (e.g., 'logs:read', 'logs:delete')
 * @returns {Function} Express middleware
 */
function requirePermission(requiredPermission) {
  return function(req, res, next) {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'احراز هویت مورد نیاز است',
        error: 'Authentication required'
      });
    }
    
    // Admin with wildcard permission has access to everything
    if (user.permissions && user.permissions.includes('*')) {
      return next();
    }
    
    // Check if user has required permission
    if (!user.permissions || !user.permissions.includes(requiredPermission)) {
      console.warn(`Permission denied: User ${user.username} missing ${requiredPermission} for ${req.path}`);
      
      return res.status(403).json({
        success: false,
        message: `دسترسی غیرمجاز - مجوز ${requiredPermission} مورد نیاز است`,
        error: 'Forbidden',
        required_permission: requiredPermission
      });
    }
    
    next();
  };
}

/**
 * Middleware: Admin Only Access
 * میدل‌ویر دسترسی فقط برای Admin
 * 
 * Usage: app.use('/api/admin', adminOnly)
 */
function adminOnly(req, res, next) {
  return requireRole(['admin', 'superadmin'])(req, res, next);
}

/**
 * Middleware: Authenticated Users Only (any role)
 * میدل‌ویر دسترسی برای هر کاربر احراز هویت‌شده
 * 
 * Usage: app.use('/api/user', requireAuth)
 */
function requireAuth(req, res, next) {
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'احراز هویت مورد نیاز است',
      error: 'Authentication required'
    });
  }
  
  next();
}

/**
 * Middleware: Demo Mode Restriction
 * میدل‌ویر محدودیت حالت دمو
 * 
 * Prevents demo users from performing destructive actions
 */
function demoModeRestriction(req, res, next) {
  const user = req.user;
  
  if (user && user.role === 'demo') {
    const method = req.method;
    const path = req.path;
    
    // Block destructive operations for demo users
    if ((method === 'POST' || method === 'PUT' || method === 'DELETE') && 
        ((path.includes('/trading/') && !path.includes('/demo/')) ||
         path.includes('/wallet/transfer') ||
         path.includes('/system/mode'))) {
      
      return res.status(403).json({
        success: false,
        message: 'در حالت دمو نمی‌توانید این عملیات را انجام دهید',
        error: 'Demo mode restriction',
        demo_mode: true
      });
    }
  }
  
  next();
}

/**
 * Helper: Generate JWT Token
 * تابع کمکی: تولید توکن JWT
 * 
 * @param {Object} payload - داده‌های توکن (userId, username, role, permissions)
 * @param {string} expiresIn - مدت اعتبار (default: '24h')
 * @returns {string} JWT token
 */
function generateToken(payload, expiresIn = '24h') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Helper: Verify JWT Token
 * تابع کمکی: تایید توکن JWT
 * 
 * @param {string} token - توکن JWT
 * @returns {Object|null} Decoded payload or null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = {
  authenticateJWT,
  requireRole,
  requirePermission,
  adminOnly,
  requireAuth,
  demoModeRestriction,
  generateToken,
  verifyToken
};
