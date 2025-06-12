const { body, param, query } = require('express-validator');

class OrderValidation {
 
  static validationRules() {
    return [

      body('itemsPurchased')
        .notEmpty()
        .custom((value) => {
          if (value && typeof value !== 'object') {
            throw new Error('Items Purchased must be a valid JSON object');
          }
          return true;
        }),
      
      body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'])
        .withMessage('Status must be one of: pending, confirmed, shipped, cancelled, delivered'),
      
      body('deliveryMethod')
        .notEmpty()
        .withMessage('Delivery method is required')
        .isIn(['pickup', 'delivery'])
        .withMessage('Delivery method must be either pickup or delivery'),
      
      body('quantity')
        .notEmpty()
        .withMessage('Quantity method is required')
        .isLength({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10 items'),
      
      body('totalAmount')
        .notEmpty()
        .withMessage('Total amount is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Total amount must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (parseFloat(value) < 0) {
            throw new Error('Total amount must be a positive number');
          }
          return true;
        }),
      
      body('tax')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Tax must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== null && parseFloat(value) < 0) {
            throw new Error('Tax must be a positive number');
          }
          return true;
        }),
      
      body('shippingFee')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Shipping fee must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== null && parseFloat(value) < 0) {
            throw new Error('Shipping fee must be a positive number');
          }
          return true;
        }),
      
      body('grandTotal')
        .notEmpty()
        .withMessage('Grand total is required')
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Grand total must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (parseFloat(value) < 0) {
            throw new Error('Grand total must be a positive number');
          }
          return true;
        }),
      
      body('paymentMethod')
        .optional()
        .isIn(['Mpesa', 'Debit/Credit Card', 'PayPal', 'Airtel Money', 'T-Cash'])
        .withMessage('Payment method must be one of: Mpesa, Debit/Credit Card, PayPal, Airtel Money, T-Cash'),
      
      body('paymentStatus')
        .optional()
        .isIn(['unpaid', 'paid', 'refunded'])
        .withMessage('Payment status must be one of: unpaid, paid, refunded'),
      
      body('deliveredAt')
        .optional()
        .isISO8601()
        .withMessage('Delivered at must be a valid date'),
      
      body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    ];
  }

  static getOrderByIdRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Order ID must be a valid UUID'),
    ];
  }

  static getOrderByNumberRules() {
    return [
      param('orderNumber')
        .notEmpty()
        .withMessage('Order number is required')
        .isLength({ min: 1, max: 50 })
        .withMessage('Order number must be between 1 and 50 characters'),
    ];
  }

  static getOrdersRules() {
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

      
      query('orderNumber')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Order number filter must be between 1 and 50 characters'),
      
      query('status')
        .optional()
        .custom((value) => {
          const validStatuses = ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'];
          if (Array.isArray(value)) {
            return value.every(status => validStatuses.includes(status));
          }
          return validStatuses.includes(value);
        })
        .withMessage('Status must be one of: pending, confirmed, shipped, cancelled, delivered'),
      
      query('deliveryMethod')
        .optional()
        .isIn(['pickup', 'delivery'])
        .withMessage('Delivery method must be either pickup or delivery'),
      
      query('paymentMethod')
        .optional()
        .isIn(['Mpesa', 'Debit/Credit Card', 'PayPal', 'Airtel Money', 'T-Cash'])
        .withMessage('Payment method must be one of: Mpesa, Debit/Credit Card, PayPal, Airtel Money, T-Cash'),
      
      query('paymentStatus')
        .optional()
        .custom((value) => {
          const validStatuses = ['unpaid', 'paid', 'refunded'];
          if (Array.isArray(value)) {
            return value.every(status => validStatuses.includes(status));
          }
          return validStatuses.includes(value);
        })
        .withMessage('Payment status must be one of: unpaid, paid, refunded'),
      
      query('minAmount')
        .optional()
        .isDecimal()
        .withMessage('Minimum amount must be a valid decimal'),
      
      query('maxAmount')
        .optional()
        .isDecimal()
        .withMessage('Maximum amount must be a valid decimal'),
      
      query('minGrandTotal')
        .optional()
        .isDecimal()
        .withMessage('Minimum grand total must be a valid decimal'),
      
      query('maxGrandTotal')
        .optional()
        .isDecimal()
        .withMessage('Maximum grand total must be a valid decimal'),
      
      query('fromDate')
        .optional()
        .isISO8601()
        .withMessage('From date must be a valid date (YYYY-MM-DD)'),
      
      query('toDate')
        .optional()
        .isISO8601()
        .withMessage('To date must be a valid date (YYYY-MM-DD)'),
      
      query('deliveredFromDate')
        .optional()
        .isISO8601()
        .withMessage('Delivered from date must be a valid date (YYYY-MM-DD)'),
      
      query('deliveredToDate')
        .optional()
        .isISO8601()
        .withMessage('Delivered to date must be a valid date (YYYY-MM-DD)'),
      
      query('hasNotes')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('hasNotes filter must be true or false'),
      
      query('sortBy')
        .optional()
        .isIn(['orderNumber', 'status', 'deliveryMethod', 'totalAmount', 'grandTotal', 'paymentMethod', 'paymentStatus', 'deliveredAt', 'createdAt', 'updatedAt'])
        .withMessage('Sort by must be one of: orderNumber, status, deliveryMethod, totalAmount, grandTotal, paymentMethod, paymentStatus, deliveredAt, createdAt, updatedAt'),
      
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
        .withMessage('Order ID must be a valid UUID'),
      
      body('status')
        .optional()
        .isIn(['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'])
        .withMessage('Status must be one of: pending, confirmed, shipped, cancelled, delivered'),
      
      body('deliveryMethod')
        .optional()
        .isIn(['pickup', 'delivery'])
        .withMessage('Delivery method must be either pickup or delivery'),

      body('quantity')
        .optional()
        .isLength({ min: 1, max: 10 })
        .withMessage('Quantity must be between 1 and 10 items'),
      
      body('totalAmount')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Total amount must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== undefined && parseFloat(value) < 0) {
            throw new Error('Total amount must be a positive number');
          }
          return true;
        }),
      
      body('tax')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Tax must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== null && value !== undefined && parseFloat(value) < 0) {
            throw new Error('Tax must be a positive number');
          }
          return true;
        }),
      
      body('shippingFee')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Shipping fee must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== null && value !== undefined && parseFloat(value) < 0) {
            throw new Error('Shipping fee must be a positive number');
          }
          return true;
        }),
      
      body('grandTotal')
        .optional()
        .isDecimal({ decimal_digits: '0,2' })
        .withMessage('Grand total must be a valid decimal with up to 2 decimal places')
        .custom((value) => {
          if (value !== undefined && parseFloat(value) < 0) {
            throw new Error('Grand total must be a positive number');
          }
          return true;
        }),
      body('itemsPurchased')
        .optional()
        .custom((value) => {
          if (value && typeof value !== 'object') {
            throw new Error('Items Purchased must be a valid JSON object');
          }
          return true;
        }),
      
      body('paymentMethod')
        .optional()
        .isIn(['Mpesa', 'Debit/Credit Card', 'PayPal', 'Airtel Money', 'T-Cash'])
        .withMessage('Payment method must be one of: Mpesa, Debit/Credit Card, PayPal, Airtel Money, T-Cash'),
      
      body('paymentStatus')
        .optional()
        .isIn(['unpaid', 'paid', 'refunded'])
        .withMessage('Payment status must be one of: unpaid, paid, refunded'),
      
      body('deliveredAt')
        .optional()
        .isISO8601()
        .withMessage('Delivered at must be a valid date'),
      
      body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    ];
  }

  static deleteRules() {
    return [
      param('id')
        .isUUID()
        .withMessage('Order ID must be a valid UUID'),
    ];
  }
}

module.exports = OrderValidation;