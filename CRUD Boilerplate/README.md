# Reusable CRUD Backend Boilerplate

A plug-and-play CRUD backend boilerplate built with Node.js, Express, and Mongoose. This project provides a solid foundation for building RESTful APIs with standardized CRUD operations, allowing you to quickly generate models and endpoints.

## Features

- 🚀 **Plug-and-Play Model Generation**: Easily create new models with custom fields
- 🔄 **Standardized CRUD Operations**: Consistent API endpoints for all models
- 🛡️ **Request Validation**: Built-in validation using Joi
- 🧩 **Modular Architecture**: Well-organized code structure
- 🔍 **Error Handling**: Comprehensive error handling middleware
- 📊 **Pagination**: Built-in pagination for list endpoints
- 🔎 **Filtering & Sorting**: Support for filtering and sorting data
- 🧪 **Environment Configuration**: Easy configuration with environment variables

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Model Generation](#model-generation)
- [CRUD Generation](#crud-generation)
- [Customization](#customization)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crud-boilerplate.git
   cd crud-boilerplate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Quick Start

### 1. Generate a new model

```bash
npm run generate:model
```

Follow the interactive prompts to define your model name and fields.

### 2. Generate CRUD operations for an existing model

```bash
npm run generate:crud
```

This will create a custom controller and update routes for the specified model.

### 3. Access your API

Once the server is running, you can access your API at:

```
http://localhost:3000/api
```

## Project Structure

```
├── config/                 # Configuration files
│   ├── config.js           # Application configuration
│   └── db.js               # Database connection
├── controllers/            # Request controllers
│   └── baseController.js   # Base controller with CRUD operations
├── middlewares/            # Express middlewares
│   └── validation.js       # Request validation middleware
├── models/                 # Mongoose models
│   ├── baseModel.js        # Base model template
│   ├── index.js            # Dynamic model loader
│   └── User.js             # Sample user model
├── routes/                 # API routes
│   ├── baseRoutes.js       # Base routes template
│   ├── index.js            # Dynamic route loader
│   └── userRoutes.js       # Sample user routes
├── scripts/                # Utility scripts
│   ├── generateModel.js    # Script to generate models
│   └── generateCrud.js     # Script to generate CRUD operations
├── utils/                  # Utility functions
│   ├── apiResponse.js      # Standardized API responses
│   └── errorHandler.js     # Error handling middleware
├── validations/            # Validation schemas
│   └── UserValidation.js   # Sample user validation
├── .env                    # Environment variables
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── server.js               # Application entry point
```

## Configuration

Configuration is managed through environment variables. Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/crud-boilerplate

# JWT Configuration (if needed)
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
```

## API Endpoints

For each model, the following RESTful endpoints are automatically created:

| Method | Endpoint             | Description                                |
|--------|----------------------|--------------------------------------------|
| GET    | /api/{model}s        | Get all resources with pagination          |
| GET    | /api/{model}s/:id    | Get a single resource by ID                |
| POST   | /api/{model}s        | Create a new resource                      |
| PUT    | /api/{model}s/:id    | Update a resource (full update)            |
| PATCH  | /api/{model}s/:id    | Update a resource (partial update)         |
| DELETE | /api/{model}s/:id    | Soft delete a resource (sets isActive=false) |
| DELETE | /api/{model}s/:id/permanent | Permanently delete a resource       |

### Example API Responses

#### Success Response

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2023-05-01T12:00:00.000Z",
    "updatedAt": "2023-05-01T12:00:00.000Z"
  },
  "meta": {}
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

## Model Generation

The model generator creates three files for each model:

1. **Model File**: Defines the Mongoose schema and model
2. **Validation File**: Defines Joi validation schemas for the model
3. **Route File**: Sets up API endpoints for the model

To generate a new model, run:

```bash
npm run generate:model
```

Follow the interactive prompts to define your model name and fields.

## CRUD Generation

The CRUD generator creates a custom controller for an existing model and updates its routes. This allows you to add custom logic to the standard CRUD operations.

To generate CRUD operations for an existing model, run:

```bash
npm run generate:crud
```

## Customization

### Adding Custom Routes

You can add custom routes to any model by editing its route file:

```javascript
// routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const UserValidation = require('../validations/UserValidation');
const createBaseRoutes = require('./baseRoutes');

// Create router with base CRUD routes
const router = createBaseRoutes(User, UserValidation);

// Add custom routes
router.get('/profile', (req, res, next) => {
  // Custom logic
});

module.exports = router;
```

### Adding Custom Controller Methods

You can add custom controller methods by creating a controller file that extends the base controller:

```javascript
// controllers/UserController.js
const BaseController = require('./baseController');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

class UserController extends BaseController {
  constructor() {
    super(User);
  }

  // Custom method
  getProfile = async (req, res, next) => {
    try {
      // Custom logic
      return ApiResponse.success(res, 200, 'Profile retrieved successfully', data);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new UserController();
```

## Error Handling

The boilerplate includes a comprehensive error handling middleware that catches and formats various types of errors:

- Mongoose validation errors
- Mongoose CastError (invalid ObjectId)
- Mongoose duplicate key errors
- JWT errors
- Custom errors

You can throw custom errors in your controllers:

```javascript
const customError = new Error('Custom error message');
customError.statusCode = 400;
throw customError;
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
