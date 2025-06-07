const { body, param, query } = require('express-validator');
const validateInternationalPhone = require('../utils/validatePhone');

class PaymentValidation {
 
  static validationRules() {
    return [
      body('orderId')
        .notEmpty()
        .withMessage('Order ID is required')
        .isUUID()
        .withMessage('Order ID must be a valid UUID'),
      
      body('amount')
        .notEmpty()
        .withMessage('Amount is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Amount must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (parseFloat(value) <= 0) {
            throw new Error('Amount must be a positive number');
          }
          return true;
        }),
      
      body('phoneNumber')
        .notEmpty()
        .withMessage('Phone number is required')
        .isMobilePhone('any')
        .withMessage('Phone number must be a valid mobile phone number'),
      
      body('cardNumber')
        .optional()
        .isLength({ min: 13, max: 19 })
        .withMessage('Card number must be between 13 and 19 digits')
        .matches(/^\d+$/)
        .withMessage('Card number must contain only digits'),
      
      body('paymentStatus')
        .optional()
        .isIn(['pending', 'completed', 'failed', 'cancelled'])
        .withMessage('Payment status must be one of: pending, completed, failed, cancelled'),
      
      body('transactionId')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Transaction ID must be between 1 and 255 characters'),
      
      body('statusMessage')
        .optional()
        .custom((value) => {
          if (value && typeof value !== 'object') {
            throw new Error('Status Message must be a valid JSON object');
          }
          return true;
        }),
      
      body('metadata')
        .optional()
        .custom((value) => {
          if (value && typeof value !== 'object') {
            throw new Error('Metadata must be a valid JSON object');
          }
          return true;
        }),
    ];
  }

  static getPaymentByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Payment ID must be a valid UUID'),
    ];
  }

  static getPaymentByReferenceRules() {
    return [
      param('reference')
        .notEmpty()
        .withMessage('Reference is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Reference must be between 1 and 255 characters'),
    ];
  }

  static getPaymentsRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('orderId')
        .optional()
        .isUUID()
        .withMessage('Order ID must be a valid UUID'),
      
      query('reference')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Reference filter must be between 1 and 255 characters'),
      
      query('paymentStatus')
        .optional()
        .custom((value) => {
          const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
          if (Array.isArray(value)) {
            return value.every(status => validStatuses.includes(status));
          }
          return validStatuses.includes(value);
        })
        .withMessage('Payment status must be one of: pending, completed, failed, cancelled'),
      
      query('transactionId')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Transaction ID filter must be between 1 and 255 characters'),
      
      query('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Phone number must be a valid mobile phone number'),
      
      query('minAmount')
        .optional()
        .isDecimal()
        .withMessage('Minimum amount must be a valid decimal'),
      
      query('maxAmount')
        .optional()
        .isDecimal()
        .withMessage('Maximum amount must be a valid decimal'),
      
      query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid date (YYYY-MM-DD)'),
      
      query('toDate')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid date (YYYY-MM-DD)'),
      
      query('hasTransactionId')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('hasTransactionId filter must be true or false'),
      
      query('hasStatusMessage')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('hasStatusMessage filter must be true or false'),
      
      query('hasMetadata')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('hasMetadata filter must be true or false'),
      
      query('sortBy')
        .optional()
        .isIn(['reference', 'amount', 'paymentStatus', 'transactionId', 'phoneNumber', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: reference, amount, paymentStatus, transactionId, phoneNumber, createdAt, updatedAt'),
      
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
        .withMessage('Payment ID must be a valid UUID'),
      
      body('amount')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Amount must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== undefined && parseFloat(value) <= 0) {
            throw new Error('Amount must be a positive number');
          }
          return true;
        }),
      
      body('paymentStatus')
        .optional()
        .isIn(['pending', 'completed', 'failed', 'cancelled'])
        .withMessage('Payment status must be one of: pending, completed, failed, cancelled'),
      
      body('transactionId')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Transaction ID must be between 1 and 255 characters'),
      
      body('statusMessage')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Status message must not exceed 500 characters'),
      
      body('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Phone number must be a valid mobile phone number')
        .custom((value) => {
          if (!validateInternationalPhone(value)) {
            throw new Error('Invalid phone number format');
          }
          return true;
        }),
      
      body('cardNumber')
        .optional()
        .isLength({ min: 13, max: 19 })
        .withMessage('Card number must be between 13 and 19 digits')
        .matches(/^\d+$/)
        .withMessage('Card number must contain only digits'),
      
      body('metadata')
        .optional()
        .custom((value) => {
          if (value && typeof value !== 'object') {
            throw new Error('Metadata must be a valid JSON object');
          }
          return true;
        }),
    ];
  }

  static deleteRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Payment ID must be a valid UUID'),
    ];
  }

  static callbackRules() {
    return [
      body('Body')
        .notEmpty()
        .withMessage('Callback body is required'),
      
      body('Body.stkCallback')
        .notEmpty()
        .withMessage('STK callback data is required'),
      
      body('Body.stkCallback.ResultCode')
        .notEmpty()
        .withMessage('Result code is required')
        .isNumeric()
        .withMessage('Result code must be numeric'),
    ];
  }
}

module.exports = PaymentValidation;