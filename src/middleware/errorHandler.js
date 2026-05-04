const { errorResponse } = require('../utils/response');

/**
 * Global error handler middleware
 * Must be registered LAST in Express app
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message);

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    return errorResponse(res, 'A record with this value already exists.', 409);
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => e.message);
    return errorResponse(res, 'Database validation failed.', 422, errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', 401);
  }

  // Default
  return errorResponse(
    res,
    err.message || 'Internal server error.',
    err.status || 500
  );
};

module.exports = errorHandler;
