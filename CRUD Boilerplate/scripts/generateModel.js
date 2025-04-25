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
 * Generate a Mongoose field definition based on field type
 * @param {string} fieldType - Field type
 * @returns {string} - Mongoose field definition
 */
const generateFieldDefinition = (fieldType) => {
  switch (fieldType.toLowerCase()) {
    case 'string':
      return 'type: String';
    case 'number':
      return 'type: Number';
    case 'boolean':
      return 'type: Boolean, default: false';
    case 'date':
      return 'type: Date, default: Date.now';
    case 'objectid':
    case 'reference':
      return 'type: mongoose.Schema.Types.ObjectId, ref: "ModelName"';
    case 'array':
      return 'type: [String]';
    case 'object':
      return 'type: Object';
    default:
      return 'type: String';
  }
};

/**
 * Generate a model file
 * @param {string} modelName - Name of the model
 * @param {Array} fields - Array of field objects
 */
const generateModelFile = (modelName, fields) => {
  const pascalCaseModelName = toPascalCase(modelName);
  const modelFilePath = path.join(__dirname, '..', 'models', `${pascalCaseModelName}.js`);

  // Generate field definitions
  const fieldDefinitions = fields.map(field => {
    const { name, type, required, unique, default: defaultValue } = field;
    
    let definition = `    ${name}: {\n      ${generateFieldDefinition(type)}`;
    
    if (required) {
      definition += ',\n      required: true';
    }
    
    if (unique) {
      definition += ',\n      unique: true';
    }
    
    if (defaultValue !== undefined && defaultValue !== '') {
      if (type.toLowerCase() === 'string') {
        definition += `,\n      default: "${defaultValue}"`;
      } else if (type.toLowerCase() === 'boolean') {
        definition += `,\n      default: ${defaultValue === 'true'}`;
      } else if (type.toLowerCase() === 'number') {
        definition += `,\n      default: ${defaultValue}`;
      }
    }
    
    definition += '\n    }';
    return definition;
  }).join(',\n');

  // Generate model file content
  const modelContent = `const mongoose = require('mongoose');
const { createBaseSchema } = require('./baseModel');

// ${pascalCaseModelName} schema fields
const ${pascalCaseModelName.toLowerCase()}Fields = {
${fieldDefinitions}
};

// Create schema with base fields
const ${pascalCaseModelName.toLowerCase()}Schema = createBaseSchema(${pascalCaseModelName.toLowerCase()}Fields);

// Add any schema methods or middleware here
// Example:
// ${pascalCaseModelName.toLowerCase()}Schema.pre('save', async function(next) {
//   // Do something before saving
//   next();
// });

// Create and export the model
const ${pascalCaseModelName} = mongoose.model('${pascalCaseModelName}', ${pascalCaseModelName.toLowerCase()}Schema);

module.exports = ${pascalCaseModelName};
`;

  // Write model file
  fs.writeFileSync(modelFilePath, modelContent);
  console.log(`Model file created: ${modelFilePath}`);
};

/**
 * Generate a validation schema file
 * @param {string} modelName - Name of the model
 * @param {Array} fields - Array of field objects
 */
const generateValidationFile = (modelName, fields) => {
  const pascalCaseModelName = toPascalCase(modelName);
  const validationFilePath = path.join(__dirname, '..', 'validations', `${pascalCaseModelName}Validation.js`);

  // Ensure validations directory exists
  const validationsDir = path.join(__dirname, '..', 'validations');
  if (!fs.existsSync(validationsDir)) {
    fs.mkdirSync(validationsDir);
  }

  // Generate validation definitions
  const validationDefinitions = fields.map(field => {
    const { name, type, required } = field;
    
    let definition = `    ${name}: Joi`;
    
    switch (type.toLowerCase()) {
      case 'string':
        definition += '.string()';
        break;
      case 'number':
        definition += '.number()';
        break;
      case 'boolean':
        definition += '.boolean()';
        break;
      case 'date':
        definition += '.date()';
        break;
      case 'objectid':
      case 'reference':
        definition += '.string().pattern(/^[0-9a-fA-F]{24}$/, "MongoDB ObjectId")';
        break;
      case 'array':
        definition += '.array()';
        break;
      case 'object':
        definition += '.object()';
        break;
      default:
        definition += '.string()';
    }
    
    if (required) {
      definition += '.required()';
    }
    
    return definition;
  }).join(',\n');

  // Generate validation file content
  const validationContent = `const Joi = require('joi');

// ${pascalCaseModelName} validation schemas
const ${pascalCaseModelName}Validation = {
  // Create validation schema
  create: Joi.object({
${validationDefinitions}
  }),

  // Update validation schema (similar to create but all fields optional)
  update: Joi.object({
${validationDefinitions.replace(/\.required\(\)/g, '')}
  })
};

module.exports = ${pascalCaseModelName}Validation;
`;

  // Write validation file
  fs.writeFileSync(validationFilePath, validationContent);
  console.log(`Validation file created: ${validationFilePath}`);
};

/**
 * Generate a route file
 * @param {string} modelName - Name of the model
 */
const generateRouteFile = (modelName) => {
  const pascalCaseModelName = toPascalCase(modelName);
  const routeFilePath = path.join(__dirname, '..', 'routes', `${pascalCaseModelName.toLowerCase()}Routes.js`);

  // Generate route file content
  const routeContent = `const express = require('express');
const ${pascalCaseModelName} = require('../models/${pascalCaseModelName}');
const ${pascalCaseModelName}Validation = require('../validations/${pascalCaseModelName}Validation');
const createBaseRoutes = require('./baseRoutes');

// Create router with base CRUD routes
const router = createBaseRoutes(${pascalCaseModelName}, ${pascalCaseModelName}Validation);

// Add custom routes here if needed
// Example:
// router.get('/custom', customController);

module.exports = router;
`;

  // Write route file
  fs.writeFileSync(routeFilePath, routeContent);
  console.log(`Route file created: ${routeFilePath}`);
};

/**
 * Main function to generate model, validation, and route files
 */
const main = async () => {
  try {
    console.log('=== Model Generator ===');
    
    // Get model name
    const modelName = await prompt('Enter model name (e.g., User, Product): ');
    if (!modelName) {
      console.error('Model name is required');
      rl.close();
      return;
    }
    
    const fields = [];
    let addMoreFields = true;
    
    console.log('\nDefine fields for the model:');
    console.log('Available types: string, number, boolean, date, objectid, array, object');
    
    while (addMoreFields) {
      const fieldName = await prompt('Field name: ');
      if (!fieldName) {
        console.log('Field name is required. Skipping this field.');
        continue;
      }
      
      const fieldType = await prompt('Field type: ');
      if (!fieldType) {
        console.log('Field type is required. Skipping this field.');
        continue;
      }
      
      const isRequired = (await prompt('Is required? (y/n): ')).toLowerCase() === 'y';
      const isUnique = (await prompt('Is unique? (y/n): ')).toLowerCase() === 'y';
      const defaultValue = await prompt('Default value (leave empty for none): ');
      
      fields.push({
        name: fieldName,
        type: fieldType,
        required: isRequired,
        unique: isUnique,
        default: defaultValue
      });
      
      const addMore = await prompt('Add another field? (y/n): ');
      addMoreFields = addMore.toLowerCase() === 'y';
    }
    
    // Generate files
    generateModelFile(modelName, fields);
    generateValidationFile(modelName, fields);
    generateRouteFile(modelName);
    
    console.log('\nFiles generated successfully!');
    console.log('\nTo use this model in your application:');
    console.log(`1. The model is automatically available through models/index.js`);
    console.log(`2. The routes are automatically registered in routes/index.js`);
    console.log(`3. Access the API at: /api/${modelName.toLowerCase()}s`);
    
    rl.close();
  } catch (error) {
    console.error('Error generating model:', error);
    rl.close();
  }
};

// Run the main function
main();
