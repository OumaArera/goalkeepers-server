const { body, param, query } = require('express-validator');

class TicketValidation {
 
  static validationRules() {
    return [
      body('match')
        .notEmpty()
        .withMessage('Match is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Match must be between 2 and 100 characters'),
      
      body('venue')
        .notEmpty()
        .withMessage('Venue is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Venue must be between 2 and 100 characters'),
      
      body('date')
        .isISO8601()
        .withMessage('Date must be a valid date in YYYY-MM-DD format')
        .custom((value) => {
          const inputDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (inputDate < today) {
            throw new Error('Date cannot be in the past');
          }
          return true;
        }),
      
      body('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be a boolean'),
    ];
  }

  static getTicketByIdRules() {
    return [
      param('ticketId')
        .isUUID()
        .withMessage('Ticket ID must be a valid UUID'),
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
      
      query('match')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Match filter must be between 1 and 100 characters'),
      
      query('venue')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Venue filter must be between 1 and 100 characters'),
      
      query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid date in YYYY-MM-DD format'),
      
      query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid date in YYYY-MM-DD format'),
      
      query('sortBy')
        .optional()
        .isIn(['match', 'venue',  'date', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: match, venue, date, createdAt, updatedAt'),

      query('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be a boolean'),
      
      query('sortOrder')
        .optional()
        .isIn(['ASC', 'DESC', 'asc', 'desc'])
        .withMessage('Sort order must be ASC or DESC'),
    ];
  }

  static updateRules() {
    return [
      param('ticketId')
        .isUUID()
        .withMessage('Ticket ID must be a valid UUID'),
      
      body('match')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Match must be between 2 and 100 characters'),
      
      body('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be a boolean'),
      
      body('venue')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Venue must be between 2 and 100 characters'),
      
      body('date')
        .optional()
        .isISO8601()
        .withMessage('Date must be a valid date in YYYY-MM-DD format')
        .custom((value) => {
          const inputDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (inputDate < today) {
            throw new Error('Date cannot be in the past');
          }
          return true;
        }),
      
    ];
  }

  static deleteRules() {
    return [
      param('ticketId')
        .isUUID()
        .withMessage('Ticket ID must be a valid UUID'),
    ];
  }
}

module.exports = TicketValidation;