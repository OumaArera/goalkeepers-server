const { body, param, query } = require('express-validator');

class LeagueValidation {
 
  static validationRules() {
    return [
      body('name')
        .notEmpty()
        .withMessage('League name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('League name must be between 2 and 100 characters'),
      
      body('level')
        .notEmpty()
        .withMessage('League level is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('League level must be between 1 and 50 characters'),
      
      body('country')
        .notEmpty()
        .withMessage('Country is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Country must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\-]+$/)
        .withMessage('Country must contain only letters, spaces, and hyphens'),
      
      body('description')
        .notEmpty()
        .withMessage('Description is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      
      body('sex')
        .notEmpty()
        .withMessage('Sex category is required')
        .isIn(['male', 'female', 'both'])
        .withMessage('Sex must be one of: male, female, both'),
      
      body('regulator')
        .notEmpty()
        .withMessage('Regulator is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Regulator must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-\.\(\)]+$/)
        .withMessage('Regulator must contain only letters, numbers, spaces, hyphens, periods, and parentheses'),
    ];
  }

  static getLeagueByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('League ID must be a valid UUID'),
    ];
  }

  static getLeaguesRules() {
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
      
      query('level')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Level filter must be between 1 and 50 characters'),
      
      query('country')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Country filter must be between 1 and 100 characters'),
      
      query('sex')
        .optional()
        .isIn(['male', 'female', 'both'])
        .withMessage('Sex filter must be one of: male, female, both'),
      
      query('regulator')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Regulator filter must be between 1 and 100 characters'),
      
      query('sortBy')
        .optional()
        .isIn(['name', 'level', 'country', 'sex', 'regulator', 'createdAt', 'updatedAt'])
        .withMessage('Sort field must be one of: name, level, country, sex, regulator, createdAt, updatedAt'),
      
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Sort order must be ASC or DESC'),
      
      query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid date (YYYY-MM-DD)'),
      
      query('toDate')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid date (YYYY-MM-DD)'),
    ];
  }

  static updateRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('League ID must be a valid UUID'),
      
      body('name')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('League name must be between 2 and 100 characters'),
      
      body('level')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('League level must be between 1 and 50 characters')
        .matches(/^[a-zA-Z0-9\s\-]+$/)
        .withMessage('League level must contain only letters, numbers, spaces, and hyphens'),
      
      body('country')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Country must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s\-]+$/)
        .withMessage('Country must contain only letters, spaces, and hyphens'),
      
      body('description')
        .optional()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
      
      body('sex')
        .optional()
        .isIn(['male', 'female', 'both'])
        .withMessage('Sex must be one of: male, female, both'),
      
      body('regulator')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Regulator must be between 2 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-\.\(\)]+$/)
        .withMessage('Regulator must contain only letters, numbers, spaces, hyphens, periods, and parentheses'),
    ];
  }

  static deleteRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('League ID must be a valid UUID'),
    ];
  }
}

module.exports = LeagueValidation;