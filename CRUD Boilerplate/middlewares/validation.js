const Joi = require('joi');
const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware for request validation using Joi
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    
    if (!error) {
      return next();
    }
    
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return ApiResponse.badRequest(res, 'Validation Error', errors);
  };
};

module.exports = { validate };
