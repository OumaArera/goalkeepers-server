const { body, param, query } = require('express-validator');

class TicketValidation {
  
  static validationRules() {
    return [
      body('eventId')
        .notEmpty()
        .withMessage('Event ID is required')
        .isUUID()
        .withMessage('Event ID must be a valid UUID'),

      body('paymentStatus')
        .optional()
        .isIn(['pending', 'completed', 'failed', 'cancelled'])
        .withMessage('Payment status must be one of: pending, completed, failed, cancelled'),
      
      body('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['VIP', 'VVIP', 'Regular'])
        .withMessage('Category must be one of: VIP, VVIP, Regular'),
      
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
      
      body('fullName')
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name must contain only letters and spaces'),
      
      body('status')
        .optional()
        .isIn(['unpaid', 'paid', 'active', 'used', 'revoked'])
        .withMessage('Status must be one of: unpaid, paid, active, used, revoked'),
    ];
  }

  static getTicketByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Ticket ID must be a valid UUID'),
    ];
  }

  static getTicketByNumberRules() {
    return [
      param('ticketNumber')
        .notEmpty()
        .withMessage('Ticket number is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Ticket number must be between 1 and 255 characters'),
    ];
  }

  static getTicketsRules() {
    return [
      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
      
      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
      
      query('eventId')
        .optional()
        .isUUID()
        .withMessage('Event ID must be a valid UUID'),
      
      query('ticketNumber')
        .optional()
        .isLength({ min: 1, max: 255 })
        .withMessage('Ticket number filter must be between 1 and 255 characters'),
      
      query('category')
        .optional()
        .custom((value) => {
          const validCategories = ['VIP', 'VVIP', 'Regular'];
          if (Array.isArray(value)) {
            return value.every(category => validCategories.includes(category));
          }
          return validCategories.includes(value);
        })
        .withMessage('Category must be one of: VIP, VVIP, Regular'),
      
      query('status')
        .optional()
        .custom((value) => {
          const validStatuses = ['unpaid', 'paid', 'active', 'used', 'revoked'];
          if (Array.isArray(value)) {
            return value.every(status => validStatuses.includes(status));
          }
          return validStatuses.includes(value);
        })
        .withMessage('Status must be one of: unpaid, paid, active, used, revoked'),
      
      query('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Phone number must be a valid mobile phone number'),
      
      query('fullName')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Full name filter must be between 1 and 100 characters'),
      
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
      
      query('hasQrCode')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('hasQrCode filter must be true or false'),
      
      query('sortBy')
        .optional()
        .isIn(['ticketNumber', 'amount', 'category', 'status', 'phoneNumber', 'fullName', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: ticketNumber, amount, category, status, phoneNumber, fullName, createdAt, updatedAt'),
      
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
        .withMessage('Ticket ID must be a valid UUID'),
      
      body('category')
        .optional()
        .isIn(['VIP', 'VVIP', 'Regular'])
        .withMessage('Category must be one of: VIP, VVIP, Regular'),
      
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
      
      body('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Phone number must be a valid mobile phone number'),

      body('paymentStatus')
        .optional()
        .isIn(['pending', 'completed', 'failed', 'cancelled'])
        .withMessage('Payment status must be one of: pending, completed, failed, cancelled'),
      
      body('fullName')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name must contain only letters and spaces'),
      
      body('status')
        .optional()
        .isIn(['unpaid', 'paid', 'active', 'used', 'revoked'])
        .withMessage('Status must be one of: unpaid, paid, active, used, revoked'),
    ];
  }

  static deleteRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Ticket ID must be a valid UUID'),
    ];
  }

  static verifyTicketRules() {
    return [
      body('ticketNumber')
        .notEmpty()
        .withMessage('Ticket number is required'),
      
      body('securityHash')
        .optional()
        .isLength({ min: 64, max: 64 })
        .withMessage('Security hash must be exactly 64 characters'),
    ];
  }
}

module.exports = TicketValidation;