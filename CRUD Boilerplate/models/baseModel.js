const mongoose = require('mongoose');

/**
 * Base schema options that will be applied to all models
 */
const baseSchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: function (doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
};

/**
 * Create a base schema with common fields
 * @param {Object} fields - Schema fields specific to the model
 * @param {Object} options - Additional schema options
 * @returns {mongoose.Schema} - Mongoose schema
 */
const createBaseSchema = (fields = {}, options = {}) => {
  const baseFields = {
    // Common fields that all models should have
    // You can add or remove fields as needed
    isActive: {
      type: Boolean,
      default: true
    },
    // Add more common fields here
  };

  return new mongoose.Schema(
    { ...baseFields, ...fields },
    { ...baseSchemaOptions, ...options }
  );
};

/**
 * Create a model with the base schema
 * @param {string} modelName - Name of the model
 * @param {Object} fields - Schema fields specific to the model
 * @param {Object} options - Additional schema options
 * @returns {mongoose.Model} - Mongoose model
 */
const createModel = (modelName, fields = {}, options = {}) => {
  const schema = createBaseSchema(fields, options);
  return mongoose.model(modelName, schema);
};

module.exports = {
  createBaseSchema,
  createModel,
  baseSchemaOptions
};
