const { body, param, query } = require('express-validator');

class ItemValidation {
 
  static validationRules (){
    return [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters'),
    
    body('category')
      .isIn(['jersey', 'gloves', 'accessory', 'ticket'])
      .withMessage('Category must be one of: jersey, gloves, accessory, ticket'),
    
    body('price')
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    
    body('quantity')
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    
    body('brand')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Brand must not exceed 50 characters'),
    
    body('size')
      .optional()
      .custom((value) => {
        if (Array.isArray(value)) {
          if (value.length === 0) return true;
          return value.every(item => 
            typeof item === 'object' && 
            typeof item.size === 'string' && 
            Number.isInteger(item.qty) && 
            item.qty >= 0
          );
        }
        return false;
      })
      .withMessage('Size must be an array of objects with size (string) and qty (integer) properties'),
    
    body('color')
      .optional()
      .isLength({ max: 30 })
      .withMessage('Color must not exceed 30 characters'),
    
    body('material')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Material must not exceed 50 characters'),
    
    body('team')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Team must not exceed 50 characters'),
    
    body('playerName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Player name must not exceed 50 characters'),
    
    body('playerNumber')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Player number must not exceed 10 characters'),
    
    body('discount')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
    
    body('available')
      .optional()
      .isBoolean()
      .withMessage('Available must be a boolean'),
    
    body('promoterId')
      .optional()
      .isUUID()
      .withMessage('Promoter ID must be a valid UUID'),
  ];
  }

  static getItemByIdRules (){
    return [
    param('itemId')
      .isUUID()
      .withMessage('Item ID must be a valid UUID'),
  ];
  }

  static getItemsRules (){
    return [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('name')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name filter must be between 1 and 100 characters'),
    
    query('category')
      .optional()
      .isIn(['jersey', 'gloves', 'accessory', 'ticket'])
      .withMessage('Category must be one of: jersey, gloves, accessory, ticket'),
    
    query('brand')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Brand filter must be between 1 and 50 characters'),
    
    query('available')
      .optional()
      .isBoolean()
      .withMessage('Available must be a boolean'),
    
    query('promoterId')
      .optional()
      .isUUID()
      .withMessage('Promoter ID must be a valid UUID'),
  ];
  }

  static updateRules (){
    return [
    param('itemId')
      .isUUID()
      .withMessage('Item ID must be a valid UUID'),
    
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    
    body('description')
      .optional()
      .isLength({ min: 10 })
      .withMessage('Description must be at least 10 characters'),
    
    body('category')
      .optional()
      .isIn(['jersey', 'gloves', 'accessory', 'ticket'])
      .withMessage('Category must be one of: jersey, gloves, accessory, ticket'),
    
    body('price')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Price must be a positive number'),
    
    body('quantity')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Quantity must be a non-negative integer'),
    
    body('brand')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Brand must not exceed 50 characters'),
    
    body('size')
      .optional()
      .custom((value) => {
        if (Array.isArray(value)) {
          if (value.length === 0) return true;
          return value.every(item => 
            typeof item === 'object' && 
            typeof item.size === 'string' && 
            Number.isInteger(item.qty) && 
            item.qty >= 0
          );
        }
        return false;
      })
      .withMessage('Size must be an array of objects with size (string) and qty (integer) properties'),
    
    body('color')
      .optional()
      .isLength({ max: 30 })
      .withMessage('Color must not exceed 30 characters'),
    
    body('material')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Material must not exceed 50 characters'),
    
    body('team')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Team must not exceed 50 characters'),
    
    body('playerName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('Player name must not exceed 50 characters'),
    
    body('playerNumber')
      .optional()
      .isLength({ max: 10 })
      .withMessage('Player number must not exceed 10 characters'),
    
    body('discount')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('Discount must be between 0 and 100'),
    
    body('available')
      .optional()
      .isBoolean()
      .withMessage('Available must be a boolean'),
    
    body('promoterId')
      .optional()
      .isUUID()
      .withMessage('Promoter ID must be a valid UUID'),
  ]

  } 
}
;

module.exports = ItemValidation;