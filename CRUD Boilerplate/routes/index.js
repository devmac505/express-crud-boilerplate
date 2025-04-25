const express = require('express');
const fs = require('fs');
const path = require('path');
const createBaseRoutes = require('./baseRoutes');

const router = express.Router();

// Get all files in the current directory
const files = fs.readdirSync(__dirname);

// Filter out index.js and baseRoutes.js
const routeFiles = files.filter(file => 
  file !== 'index.js' && 
  file !== 'baseRoutes.js' && 
  file.endsWith('.js')
);

// Load each route
routeFiles.forEach(file => {
  const routeName = path.basename(file, '.js');
  const route = require(path.join(__dirname, file));
  
  // Convert route name to kebab-case for URL path
  // e.g., userRoutes.js becomes /users
  const routePath = `/${routeName.replace('Routes', '').toLowerCase()}s`;
  
  router.use(routePath, route);
});

// Welcome route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CRUD Boilerplate API',
    version: '1.0.0',
    availableRoutes: routeFiles.map(file => {
      const routeName = path.basename(file, '.js');
      return `/${routeName.replace('Routes', '').toLowerCase()}s`;
    })
  });
});

/**
 * Register a new route for a model
 * @param {string} routePath - URL path for the route
 * @param {mongoose.Model} model - Mongoose model
 * @param {Object} validationSchemas - Joi validation schemas
 */
const registerRoute = (routePath, model, validationSchemas = {}) => {
  const baseRoutes = createBaseRoutes(model, validationSchemas);
  router.use(routePath, baseRoutes);
};

module.exports = router;
module.exports.registerRoute = registerRoute;
