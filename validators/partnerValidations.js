const { body, param, query } = require('express-validator');

class PartnerValidation {
 
  static validationRules() {
    return [
      body('name')
        .notEmpty()
        .withMessage('Partner name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Partner name must be between 2 and 100 characters'),
      
      body('slogan')
        .notEmpty()
        .withMessage('Slogan is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Slogan must be between 5 and 200 characters'),
      
      body('websiteUrl')
        .optional()
        .isURL()
        .withMessage('Website URL must be a valid URL')
        .isLength({ max: 500 })
        .withMessage('Website URL must not exceed 500 characters'),
    ];
  }

  static getPartnerByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Partner ID must be a valid UUID'),
    ];
  }

  static getPartnersRules() {
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
      
      query('slogan')
        .optional()
        .isLength({ min: 1, max: 200 })
        .withMessage('Slogan filter must be between 1 and 200 characters'),
      
      query('websiteUrl')
        .optional()
        .isLength({ min: 1, max: 500 })
        .withMessage('Website URL filter must be between 1 and 500 characters'),
      
      query('hasWebsite')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('hasWebsite filter must be true or false'),
      
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
        .isIn(['name', 'slogan', 'websiteUrl', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: name, slogan, websiteUrl, createdAt, updatedAt'),
      
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Sort order must be ASC or DESC'),
    ];
  }

  static updateRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Partner ID must be a valid UUID'),
      
      body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Partner name must be between 2 and 100 characters'),
      
      body('slogan')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('Slogan must be between 5 and 200 characters'),
      
      body('websiteUrl')
        .optional()
        .isURL()
        .withMessage('Website URL must be a valid URL')
        .isLength({ max: 500 })
        .withMessage('Website URL must not exceed 500 characters'),
    ];
  }

  static deleteRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Partner ID must be a valid UUID'),
    ];
  }
}

module.exports = PartnerValidation;