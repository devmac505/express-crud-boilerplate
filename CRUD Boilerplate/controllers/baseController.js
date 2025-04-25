const ApiResponse = require('../utils/apiResponse');

/**
 * Base Controller with CRUD operations
 * @param {mongoose.Model} model - Mongoose model
 */
class BaseController {
  constructor(model) {
    this.model = model;
  }

  /**
   * Create a new document
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  create = async (req, res, next) => {
    try {
      const doc = await this.model.create(req.body);
      return ApiResponse.success(res, 201, 'Resource created successfully', doc);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all documents with pagination
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAll = async (req, res, next) => {
    try {
      // Pagination
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const skip = (page - 1) * limit;

      // Filtering
      let filter = {};
      if (req.query.filter) {
        try {
          filter = JSON.parse(req.query.filter);
        } catch (error) {
          return ApiResponse.badRequest(res, 'Invalid filter format');
        }
      }

      // Handle isActive filter
      if (req.query.isActive !== undefined) {
        filter.isActive = req.query.isActive === 'true';
      }

      // Sorting
      let sort = {};
      if (req.query.sort) {
        try {
          sort = JSON.parse(req.query.sort);
        } catch (error) {
          return ApiResponse.badRequest(res, 'Invalid sort format');
        }
      } else {
        // Default sort by createdAt descending
        sort = { createdAt: -1 };
      }

      // Execute query with pagination
      const docs = await this.model.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);

      // Get total count for pagination
      const total = await this.model.countDocuments(filter);

      // Pagination metadata
      const meta = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      };

      return ApiResponse.success(res, 200, 'Resources retrieved successfully', docs, meta);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a document by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getById = async (req, res, next) => {
    try {
      const doc = await this.model.findById(req.params.id);
      
      if (!doc) {
        return ApiResponse.notFound(res, 'Resource not found');
      }
      
      return ApiResponse.success(res, 200, 'Resource retrieved successfully', doc);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a document by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  update = async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!doc) {
        return ApiResponse.notFound(res, 'Resource not found');
      }
      
      return ApiResponse.success(res, 200, 'Resource updated successfully', doc);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a document by ID (soft delete by setting isActive to false)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  softDelete = async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      
      if (!doc) {
        return ApiResponse.notFound(res, 'Resource not found');
      }
      
      return ApiResponse.success(res, 200, 'Resource deleted successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Permanently delete a document by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  hardDelete = async (req, res, next) => {
    try {
      const doc = await this.model.findByIdAndDelete(req.params.id);
      
      if (!doc) {
        return ApiResponse.notFound(res, 'Resource not found');
      }
      
      return ApiResponse.success(res, 200, 'Resource permanently deleted');
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BaseController;
