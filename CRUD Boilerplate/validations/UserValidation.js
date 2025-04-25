const Joi = require('joi');

// User validation schemas
const UserValidation = {
  // Create validation schema
  create: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('user', 'admin')
  }),

  // Update validation schema (similar to create but all fields optional)
  update: Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string().min(6),
    role: Joi.string().valid('user', 'admin')
  })
};

module.exports = UserValidation;
