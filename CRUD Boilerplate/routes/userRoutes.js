const express = require('express');
const User = require('../models/User');
const UserValidation = require('../validations/UserValidation');
const createBaseRoutes = require('./baseRoutes');

// Create router with base CRUD routes
const router = createBaseRoutes(User, UserValidation);

// Add custom routes here if needed
// Example:
// router.get('/profile', authMiddleware, (req, res) => {
//   // Custom logic
// });

module.exports = router;
