const { body } = require('express-validator');
const validateInternationalPhone = require('../utils/validatePhone');

class UserValidation {
  static validationRules() {
    return [
      body('firstName')
        .isString()
        .notEmpty()
        .withMessage('First name is required'),
      body('middleNames')
        .optional()
        .isString(),
      body('lastName')
        .isString()
        .notEmpty()
        .withMessage('Last name is required'),
      body('dateOfBirth')
        .isISO8601()
        .withMessage('Valid date of birth is required'),
      body('nationalIdOrPassportNo')
        .isString()
        .notEmpty()
        .withMessage('National ID or Passport number is required'),
      body('role')
        .isIn(['superuser', 'manager', 'player', 'junior', 'director'])
        .withMessage('Valid role is required'),
      body('department')
        .isIn(['Sales', 'Analysis', 'Services', 'Donors', 'IT', 'Players', 'Management'])
        .withMessage('Valid department is required'),
      body('phonenumber')
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      body('email')
        .isEmail()
        .withMessage('Valid email is required'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
      body('status')
        .optional()
        .isIn(['active', 'blocked', 'suspended', 'deleted']),
      body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
    ];
  }

  static updateRules() {
    return [
      body('firstName')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('First name cannot be empty'),
      body('middleNames')
        .optional()
        .isString(),
      body('lastName')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Last name cannot be empty'),
      body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Valid date of birth is required'),
      body('nationalIdOrPassportNo')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('National ID or Passport number cannot be empty'),
      body('role')
        .optional()
        .isIn(['superuser', 'manager', 'player', 'junior', 'director'])
        .withMessage('Valid role is required'),
      body('department')
        .optional()
        .isIn(['Sales', 'Analysis', 'Services', 'Donors', 'IT', 'Players', 'Management'])
        .withMessage('Valid department is required'),
      body('phonenumber')
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
        .withMessage('Valid email is required'),
      body('status')
        .optional()
        .isIn(['active', 'blocked', 'suspended', 'deleted']),
      body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL'),
    ];
  }

  static recoverPasswordValidationRules() {
    return [
      body('email')
        .isEmail()
        .withMessage('Valid email is required')
    ];
  }

  static passwordValidationRules() {
    return [
      body('oldPassword')
        .isString()
        .notEmpty()
        .withMessage('Old password is required'),
      body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long'),
    ];
  }

  static loginValidationRules() {
    return [
      body('email')
        .isEmail()
        .withMessage('Valid email is required'),
      body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }
}

module.exports = UserValidation;