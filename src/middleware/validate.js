const { errorResponse } = require('../utils/response');

/**
 * Middleware factory: validate request body against a JOI schema
 * Usage: validate(schema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,   // collect all errors, not just the first
      stripUnknown: true,  // remove fields not in schema
    });

    if (error) {
      const errors = error.details.map((d) => d.message.replace(/"/g, "'"));
      return errorResponse(res, 'Validation failed.', 422, errors);
    }

    req.body = value; // use sanitised value
    next();
  };
};

module.exports = validate;
