const { body, param, query } = require('express-validator');

class TicketCategoryValidation {
 
  static validationRules() {
    return [
      body('ticketRepoId')
        .notEmpty()
        .withMessage('Ticket repository ID is required')
        .isUUID()
        .withMessage('Ticket repository ID must be a valid UUID'),
      
      body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['VIP', 'VVIP', 'Regular'])
        .withMessage('Category must be one of: VIP, VVIP, Regular'),
      
      body('price')
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
    ];
  }

  static getTicketCategoryByIdRules() {
    return [
      param('ticketCategoryId')
        .isUUID()
        .withMessage('Ticket category ID must be a valid UUID'),
    ];
  }

  static getTicketCategoriesRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('ticketRepoId')
        .optional()
        .isUUID()
        .withMessage('Ticket repository ID must be a valid UUID'),
      
      query('category')
        .optional()
        .isIn(['VIP', 'VVIP', 'Regular'])
        .withMessage('Category must be one of: VIP, VVIP, Regular'),
      
      query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a non-negative number'),
      
      query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a non-negative number'),
      
      query('sortBy')
        .optional()
        .isIn(['category', 'price', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: category, price, createdAt, updatedAt'),
      
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Sort order must be ASC or DESC'),
    ];
  }


  static updateRules() {
    return [
      param('ticketCategoryId')
        .isUUID()
        .withMessage('Ticket category ID must be a valid UUID'),
      
      body('ticketRepoId')
        .optional()
        .isUUID()
        .withMessage('Ticket repository ID must be a valid UUID'),
      
      body('category')
        .optional()
        .isIn(['VIP', 'VVIP', 'Regular'])
        .withMessage('Category must be one of: VIP, VVIP, Regular'),
      
      body('price')
        .optional()
        .isFloat({ min: 0.01 })
        .withMessage('Price must be a positive number'),
    ];
  }

  static deleteRules() {
    return [
      param('ticketCategoryId')
        .isUUID()
        .withMessage('Ticket category ID must be a valid UUID'),
    ];
  }

}

module.exports = TicketCategoryValidation;