const express = require('express');
const BaseController = require('../controllers/baseController');
const { validate } = require('../middlewares/validation');

/**
 * Create base routes for a model with CRUD operations
 * @param {mongoose.Model} model - Mongoose model
 * @param {Object} validationSchemas - Joi validation schemas for the model
 * @returns {express.Router} - Express router
 */
const createBaseRoutes = (model, validationSchemas = {}) => {
  const router = express.Router();
  const controller = new BaseController(model);

  // Default empty validation schema
  const defaultSchema = {
    create: null,
    update: null
  };

  // Merge provided schemas with defaults
  const schemas = { ...defaultSchema, ...validationSchemas };

  // Create a new resource
  router.post(
    '/',
    schemas.create ? validate(schemas.create) : (req, res, next) => next(),
    controller.create
  );

  // Get all resources with pagination
  router.get('/', controller.getAll);

  // Get a resource by ID
  router.get('/:id', controller.getById);

  // Update a resource
  router.put(
    '/:id',
    schemas.update ? validate(schemas.update) : (req, res, next) => next(),
    controller.update
  );

  // Patch a resource
  router.patch(
    '/:id',
    schemas.update ? validate(schemas.update) : (req, res, next) => next(),
    controller.update
  );

  // Soft delete a resource
  router.delete('/:id', controller.softDelete);

  // Hard delete a resource
  router.delete('/:id/permanent', controller.hardDelete);

  return router;
};

module.exports = createBaseRoutes;
