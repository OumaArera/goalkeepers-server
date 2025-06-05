const { body, param, query } = require('express-validator');
const validateInternationalPhone = require('../utils/validatePhone');

class NewRequestValidation {
 
  static validationRules() {
    return [
      body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name must contain only letters and spaces'),
      
      body('middleNames')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Middle names must not exceed 100 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Middle names must contain only letters and spaces'),
      
      body('lastNames')
        .notEmpty()
        .withMessage('Last names are required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last names must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last names must contain only letters and spaces'),
      
      body('dateOfBirth')
        .isISO8601()
        .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 12 || age > 45) {
            throw new Error('Age must be between 12 and 45 years');
          }
          
          return true;
        }),
      
      body('height')
        .isFloat({ min: 1.0, max: 10.0 })
        .withMessage('Height must be between 1.0 and 10.0 meters'),
      
      body('weight')
        .isFloat({ min: 30.0, max: 200.0 })
        .withMessage('Weight must be between 30.0 and 200.0 kg'),
      
      body('phoneNumber')
        .notEmpty()
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      
      body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),
      
      body('clubsPlayedFor')
        .isInt({ min: 0, max: 50 })
        .withMessage('Clubs played for must be between 0 and 50'),
      
      body('recentClub')
        .notEmpty()
        .withMessage('Recent club is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Recent club must be between 2 and 100 characters'),
      
      body('yearsOfGoalkeeping')
        .isInt({ min: 0, max: 50 })
        .withMessage('Years of goalkeeping must be between 0 and 50'),
      
      body('requestDetails')
        .notEmpty()
        .withMessage('Request details are required')
        .isLength({ min: 20, max: 1000 })
        .withMessage('Request details must be between 20 and 1000 characters'),
      
      body('nextOfKinEmail')
        .optional()
        .isEmail()
        .withMessage('Next of kin email must be a valid email address')
        .normalizeEmail(),
      
      body('nextOfKinName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Next of kin name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Next of kin name must contain only letters and spaces'),
      
      body('nextOfKinPhoneNumber')
        .optional()
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      
      body('status')
        .optional()
        .isIn(['pending', 'approved', 'declined'])
        .withMessage('Status must be one of: pending, approved, declined'),
    ];
  }

  static getNewRequestByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Request ID must be a valid UUID'),
    ];
  }

  static getNewRequestsRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('firstName')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name filter must be between 1 and 50 characters'),
      
      query('lastNames')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last names filter must be between 1 and 50 characters'),
      
      query('recentClub')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Recent club filter must be between 1 and 100 characters'),
      
      query('status')
        .optional()
        .isIn(['pending', 'approved', 'declined'])
        .withMessage('Status filter must be one of: pending, approved, declined'),
      
      query('minAge')
        .optional()
        .isInt({ min: 12, max: 45 })
        .withMessage('Minimum age must be between 16 and 60'),
      
      query('maxAge')
        .optional()
        .isInt({ min: 12, max: 45 })
        .withMessage('Maximum age must be between 16 and 60'),
      
      query('minHeight')
        .optional()
        .isFloat({ min: 1.0, max: 10.0 })
        .withMessage('Minimum height must be between 1.0 and 10.0 meters'),
      
      query('maxHeight')
        .optional()
        .isFloat({ min: 1.0, max: 10.0 })
        .withMessage('Maximum height must be between 1.0 and 10.0 meters'),
      
      query('minWeight')
        .optional()
        .isFloat({ min: 30.0, max: 200.0 })
        .withMessage('Minimum weight must be between 30.0 and 200.0 kg'),
      
      query('maxWeight')
        .optional()
        .isFloat({ min: 30.0, max: 200.0 })
        .withMessage('Maximum weight must be between 30.0 and 200.0 kg'),
      
      query('minExperience')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Minimum experience must be between 0 and 50 years'),
      
      query('maxExperience')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Maximum experience must be between 0 and 50 years'),
    ];
  }

  static updateRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Request ID must be a valid UUID'),
      
      body('firstName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name must contain only letters and spaces'),
      
      body('middleNames')
        .optional()
        .isLength({ max: 100 })
        .withMessage('Middle names must not exceed 100 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Middle names must contain only letters and spaces'),
      
      body('lastNames')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last names must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last names must contain only letters and spaces'),
      
      body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Date of birth must be a valid date (YYYY-MM-DD)')
        .custom((value) => {
          const birthDate = new Date(value);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 12 || age > 45) {
            throw new Error('Age must be between 12 and 45 years');
          }
          
          return true;
        }),
      
      body('height')
        .optional()
        .isFloat({ min: 1.0, max: 10.0 })
        .withMessage('Height must be between 1.0 and 10 meters'),
      
      body('weight')
        .optional()
        .isFloat({ min: 30.0, max: 200.0 })
        .withMessage('Weight must be between 30.0 and 200.0 kg'),
      
      body('phoneNumber')
        .optional()
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      
      body('email')
        .optional()
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),
      
      body('clubsPlayedFor')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Clubs played for must be between 0 and 50'),
      
      body('recentClub')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Recent club must be between 2 and 100 characters'),
      
      body('yearsOfGoalkeeping')
        .optional()
        .isInt({ min: 0, max: 50 })
        .withMessage('Years of goalkeeping must be between 0 and 50'),
      
      body('requestDetails')
        .optional()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Request details must be between 20 and 1000 characters'),
      
      body('nextOfKinEmail')
        .optional()
        .isEmail()
        .withMessage('Next of kin email must be a valid email address')
        .normalizeEmail(),
      
      body('nextOfKinName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Next of kin name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]*$/)
        .withMessage('Next of kin name must contain only letters and spaces'),
      
      body('nextOfKinPhoneNumber')
        .optional()
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      
      body('status')
        .optional()
        .isIn(['pending', 'approved', 'declined'])
        .withMessage('Status must be one of: pending, approved, declined'),
    ];
  }

  static deleteRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Request ID must be a valid UUID'),
    ];
  }
}

module.exports = NewRequestValidation;