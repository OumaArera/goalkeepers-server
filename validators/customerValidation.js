const { body } = require('express-validator');
const validateInternationalPhone = require('../utils/validatePhone');

class CustomerValidation {
  static validationRules() {
    return [
      body('firstName')
        .isString()
        .notEmpty()
        .withMessage('First name is required'),
      body('lastName')
        .isString()
        .notEmpty()
        .withMessage('Last name is required'),
      body('phoneNumber')
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      body('email')
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('Valid email is required'),
      body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
      body('status')
        .optional()
        .isIn(['active', 'blocked', 'suspended', 'deleted'])
        .withMessage('Valid status is required'),
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
      body('phoneNumber')
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required'),
    ];
  }

  static recoverPasswordValidationRules() {
    return [
      body('phoneNumber')
        .isString()
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
    ];
  }

  static updateValidationRules() {
    return [
      body('firstName')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('First name cannot be empty'),
      body('lastName')
        .optional()
        .isString()
        .notEmpty()
        .withMessage('Last name cannot be empty'),
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
        .optional({ checkFalsy: true })
        .isEmail()
        .withMessage('Valid email is required'),
      body('status')
        .optional()
        .isIn(['active', 'blocked', 'suspended', 'deleted'])
        .withMessage('Valid status is required'),
    ];
  }
}

module.exports = CustomerValidation;