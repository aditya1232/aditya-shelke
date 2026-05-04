const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const { User, Role } = require('../models');

/**
 * Middleware: verify JWT token and attach user to req
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user with role from DB
    const user = await User.findOne({
      where: { id: decoded.id, isActive: true },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) {
      return errorResponse(res, 'User not found or inactive.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please login again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token.', 401);
    }
    return errorResponse(res, 'Authentication failed.', 500);
  }
};

module.exports = authenticate;
