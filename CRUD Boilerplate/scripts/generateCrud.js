const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 * @param {string} question - Question to ask
 * @returns {Promise<string>} - User input
 */
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

/**
 * Convert string to PascalCase
 * @param {string} str - String to convert
 * @returns {string} - PascalCase string
 */
const toPascalCase = (str) => {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (s) => s.toUpperCase());
};

/**
 * Convert string to camelCase
 * @param {string} str - String to convert
 * @returns {string} - camelCase string
 */
const toCamelCase = (str) => {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (s) => s.toLowerCase());
};

/**
 * Generate a custom controller file
 * @param {string} modelName - Name of the model
 */
const generateControllerFile = (modelName) => {
  const pascalCaseModelName = toPascalCase(modelName);
  const camelCaseModelName = toCamelCase(modelName);
  const controllerFilePath = path.join(__dirname, '..', 'controllers', `${pascalCaseModelName}Controller.js`);

  // Generate controller file content
  const controllerContent = `const BaseController = require('./baseController');
const ${pascalCaseModelName} = require('../models/${pascalCaseModelName}');
const ApiResponse = require('../utils/apiResponse');

/**
 * ${pascalCaseModelName} Controller
 */
class ${pascalCaseModelName}Controller extends BaseController {
  constructor() {
    super(${pascalCaseModelName});
  }

  /**
   * Example of a custom controller method
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  customMethod = async (req, res, next) => {
    try {
      // Example implementation
      const ${camelCaseModelName}s = await this.model.find({ isActive: true }).limit(5);
      return ApiResponse.success(res, 200, 'Custom method executed successfully', ${camelCaseModelName}s);
    } catch (error) {
      next(error);
    }
  };

  // Add more custom methods as needed
}

module.exports = new ${pascalCaseModelName}Controller();
`;

  // Write controller file
  fs.writeFileSync(controllerFilePath, controllerContent);
  console.log(`Controller file created: ${controllerFilePath}`);
};

/**
 * Update route file to use custom controller
 * @param {string} modelName - Name of the model
 */
const updateRouteFile = (modelName) => {
  const pascalCaseModelName = toPascalCase(modelName);
  const routeFilePath = path.join(__dirname, '..', 'routes', `${pascalCaseModelName.toLowerCase()}Routes.js`);

  // Check if route file exists
  if (!fs.existsSync(routeFilePath)) {
    console.log(`Route file not found: ${routeFilePath}`);
    console.log(`Creating new route file...`);
    
    // Generate route file content
    const routeContent = `const express = require('express');
const ${pascalCaseModelName}Controller = require('../controllers/${pascalCaseModelName}Controller');
const ${pascalCaseModelName}Validation = require('../validations/${pascalCaseModelName}Validation');
const { validate } = require('../middlewares/validation');

const router = express.Router();

// Create a new resource
router.post(
  '/',
  validate(${pascalCaseModelName}Validation.create),
  ${pascalCaseModelName}Controller.create
);

// Get all resources with pagination
router.get('/', ${pascalCaseModelName}Controller.getAll);

// Get a resource by ID
router.get('/:id', ${pascalCaseModelName}Controller.getById);

// Update a resource
router.put(
  '/:id',
  validate(${pascalCaseModelName}Validation.update),
  ${pascalCaseModelName}Controller.update
);

// Patch a resource
router.patch(
  '/:id',
  validate(${pascalCaseModelName}Validation.update),
  ${pascalCaseModelName}Controller.update
);

// Soft delete a resource
router.delete('/:id', ${pascalCaseModelName}Controller.softDelete);

// Hard delete a resource
router.delete('/:id/permanent', ${pascalCaseModelName}Controller.hardDelete);

// Custom route example
router.get('/custom', ${pascalCaseModelName}Controller.customMethod);

module.exports = router;
`;

    // Write route file
    fs.writeFileSync(routeFilePath, routeContent);
    console.log(`Route file created: ${routeFilePath}`);
    return;
  }

  // Read existing route file
  const routeContent = fs.readFileSync(routeFilePath, 'utf8');

  // Check if already using custom controller
  if (routeContent.includes(`${pascalCaseModelName}Controller`)) {
    console.log(`Route file already using custom controller: ${routeFilePath}`);
    return;
  }

  // Update route file to use custom controller
  const updatedRouteContent = routeContent
    .replace(
      `const ${pascalCaseModelName} = require('../models/${pascalCaseModelName}');`,
      `const ${pascalCaseModelName}Controller = require('../controllers/${pascalCaseModelName}Controller');`
    )
    .replace(
      `const router = createBaseRoutes(${pascalCaseModelName}, ${pascalCaseModelName}Validation);`,
      `const router = express.Router();

// Create a new resource
router.post(
  '/',
  validate(${pascalCaseModelName}Validation.create),
  ${pascalCaseModelName}Controller.create
);

// Get all resources with pagination
router.get('/', ${pascalCaseModelName}Controller.getAll);

// Get a resource by ID
router.get('/:id', ${pascalCaseModelName}Controller.getById);

// Update a resource
router.put(
  '/:id',
  validate(${pascalCaseModelName}Validation.update),
  ${pascalCaseModelName}Controller.update
);

// Patch a resource
router.patch(
  '/:id',
  validate(${pascalCaseModelName}Validation.update),
  ${pascalCaseModelName}Controller.update
);

// Soft delete a resource
router.delete('/:id', ${pascalCaseModelName}Controller.softDelete);

// Hard delete a resource
router.delete('/:id/permanent', ${pascalCaseModelName}Controller.hardDelete);

// Custom route example
router.get('/custom', ${pascalCaseModelName}Controller.customMethod);`
    );

  // Write updated route file
  fs.writeFileSync(routeFilePath, updatedRouteContent);
  console.log(`Route file updated: ${routeFilePath}`);
};

/**
 * Generate validation file if it doesn't exist
 * @param {string} modelName - Name of the model
 */
const ensureValidationFile = (modelName) => {
  const pascalCaseModelName = toPascalCase(modelName);
  const validationFilePath = path.join(__dirname, '..', 'validations', `${pascalCaseModelName}Validation.js`);

  // Ensure validations directory exists
  const validationsDir = path.join(__dirname, '..', 'validations');
  if (!fs.existsSync(validationsDir)) {
    fs.mkdirSync(validationsDir);
  }

  // Check if validation file exists
  if (fs.existsSync(validationFilePath)) {
    console.log(`Validation file already exists: ${validationFilePath}`);
    return;
  }

  // Generate basic validation file content
  const validationContent = `const Joi = require('joi');

// ${pascalCaseModelName} validation schemas
const ${pascalCaseModelName}Validation = {
  // Create validation schema
  create: Joi.object({
    // Add validation rules based on your model
    // Example:
    // name: Joi.string().required(),
    // email: Joi.string().email().required(),
    // age: Joi.number().integer().min(0)
  }),

  // Update validation schema (similar to create but all fields optional)
  update: Joi.object({
    // Add validation rules based on your model
    // Example:
    // name: Joi.string(),
    // email: Joi.string().email(),
    // age: Joi.number().integer().min(0)
  })
};

module.exports = ${pascalCaseModelName}Validation;
`;

  // Write validation file
  fs.writeFileSync(validationFilePath, validationContent);
  console.log(`Validation file created: ${validationFilePath}`);
};

/**
 * Main function to generate CRUD files
 */
const main = async () => {
  try {
    console.log('=== CRUD Generator ===');
    
    // Get model name
    const modelName = await prompt('Enter model name (e.g., User, Product): ');
    if (!modelName) {
      console.error('Model name is required');
      rl.close();
      return;
    }
    
    const pascalCaseModelName = toPascalCase(modelName);
    const modelFilePath = path.join(__dirname, '..', 'models', `${pascalCaseModelName}.js`);
    
    // Check if model file exists
    if (!fs.existsSync(modelFilePath)) {
      console.log(`Model file not found: ${modelFilePath}`);
      const createModel = await prompt('Do you want to create a model file? (y/n): ');
      
      if (createModel.toLowerCase() === 'y') {
        console.log(`Please run 'npm run generate:model' to create the model first.`);
      }
      
      rl.close();
      return;
    }
    
    // Generate files
    generateControllerFile(modelName);
    ensureValidationFile(modelName);
    updateRouteFile(modelName);
    
    console.log('\nCRUD files generated successfully!');
    console.log('\nTo use these files in your application:');
    console.log(`1. The controller is available at controllers/${pascalCaseModelName}Controller.js`);
    console.log(`2. The routes are defined in routes/${pascalCaseModelName.toLowerCase()}Routes.js`);
    console.log(`3. Access the API at: /api/${modelName.toLowerCase()}s`);
    console.log(`4. Custom endpoint example: /api/${modelName.toLowerCase()}s/custom`);
    
    rl.close();
  } catch (error) {
    console.error('Error generating CRUD files:', error);
    rl.close();
  }
};

// Run the main function
main();
