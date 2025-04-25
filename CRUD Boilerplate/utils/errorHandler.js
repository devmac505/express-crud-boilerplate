const ApiResponse = require('./apiResponse');
const { config } = require('../config/config');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map(val => val.message);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errors = { field: Object.keys(err.keyValue)[0], value: Object.values(err.keyValue)[0] };
  }

  // In production, don't send the stack trace
  const error = {
    message,
    ...(errors && { errors }),
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  };

  return ApiResponse.error(res, statusCode, message, errors);
};

module.exports = errorHandler;
