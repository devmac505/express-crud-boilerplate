const fs = require('fs');
const path = require('path');
const { createModel } = require('./baseModel');

// This file dynamically loads all models from the models directory
// and exports them as a single object

const models = {};

// Get all files in the current directory
const files = fs.readdirSync(__dirname);

// Filter out index.js and baseModel.js
const modelFiles = files.filter(file => 
  file !== 'index.js' && 
  file !== 'baseModel.js' && 
  file.endsWith('.js')
);

// Load each model
modelFiles.forEach(file => {
  const modelName = path.basename(file, '.js');
  const model = require(path.join(__dirname, file));
  models[modelName] = model;
});

/**
 * Dynamically create a model with the given name and fields
 * @param {string} modelName - Name of the model (PascalCase)
 * @param {Object} fields - Schema fields for the model
 * @param {Object} options - Additional schema options
 * @returns {mongoose.Model} - Mongoose model
 */
const generateModel = (modelName, fields = {}, options = {}) => {
  const model = createModel(modelName, fields, options);
  models[modelName] = model;
  return model;
};

module.exports = {
  ...models,
  generateModel
};
