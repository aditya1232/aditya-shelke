const { errorResponse } = require('../utils/response');

/**
 * Middleware: Role-Based Access Control (RBAC)
 * Usage: authorize('admin')  or  authorize('admin', 'manager')
 *
 * Role hierarchy:
 *   admin   → full access
 *   manager → manage resources
 *   user    → basic read access
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Unauthorized. No role assigned.', 403);
    }

    const userRole = req.user.role.name;

    if (!allowedRoles.includes(userRole)) {
      return errorResponse(
        res,
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${userRole}`,
        403
      );
    }

    next();
  };
};

module.exports = authorize;
