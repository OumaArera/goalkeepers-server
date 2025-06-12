const { body, param, query } = require('express-validator');

class CartValidation {
 
  static addToCartRules() {
    return [
      body('itemId')
        .notEmpty()
        .withMessage('Item ID is required')
        .isUUID()
        .withMessage('Item ID must be a valid UUID'),
      
      body('status')
        .optional()
        .isIn(['pending', 'bought', 'removed'])
        .withMessage('Status must be one of: pending, bought, removed'),
    ];
  }

  static getCartItemByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Cart item ID must be a valid UUID'),
    ];
  }

  static getCartItemsRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('customerId')
        .optional()
        .isUUID()
        .withMessage('Customer ID must be a valid UUID'),
      
      query('itemId')
        .optional()
        .isUUID()
        .withMessage('Item ID must be a valid UUID'),
      
      query('status')
        .optional()
        .custom((value) => {
          const validStatuses = ['pending', 'bought', 'removed'];
          if (Array.isArray(value)) {
            return value.every(status => validStatuses.includes(status));
          }
          return validStatuses.includes(value);
        })
        .withMessage('Status must be one of: pending, bought, removed'),
      
      query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid date (YYYY-MM-DD)'),
      
      query('toDate')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid date (YYYY-MM-DD)'),
      
      query('sortBy')
        .optional()
        .isIn(['customerId', 'itemId', 'status', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: customerId, itemId, status, createdAt, updatedAt'),
      
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Sort order must be ASC or DESC'),
    ];
  }

  static getCustomerCartRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('itemId')
        .optional()
        .isUUID()
        .withMessage('Item ID must be a valid UUID'),
      
      query('status')
        .optional()
        .custom((value) => {
          const validStatuses = ['pending', 'bought', 'removed'];
          if (Array.isArray(value)) {
            return value.every(status => validStatuses.includes(status));
          }
          return validStatuses.includes(value);
        })
        .withMessage('Status must be one of: pending, bought, removed'),
      
      query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid date (YYYY-MM-DD)'),
      
      query('toDate')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid date (YYYY-MM-DD)'),
      
      query('sortBy')
        .optional()
        .isIn(['itemId', 'status', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: itemId, status, createdAt, updatedAt'),
      
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Sort order must be ASC or DESC'),
    ];
  }

  static updateCartItemRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Cart item ID must be a valid UUID'),
      
      body('status')
        .optional()
        .isIn(['pending', 'bought', 'removed'])
        .withMessage('Status must be one of: pending, bought, removed'),
    ];
  }

  static removeFromCartRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Cart item ID must be a valid UUID'),
    ];
  }

  static clearCartRules() {
    return [
      query('status')
        .optional()
        .isIn(['pending', 'bought', 'removed'])
        .withMessage('Status must be one of: pending, bought, removed'),
    ];
  }
}

module.exports = CartValidation;