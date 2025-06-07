const { Op } = require('sequelize');

class PaymentFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Order ID filter
    if (queryParams.orderId) {
      filters.orderId = queryParams.orderId;
    }

    // Reference filter (partial match)
    if (queryParams.reference) {
      filters.reference = { [Op.iLike]: `%${queryParams.reference}%` };
    }

    // Payment status filter
    if (queryParams.paymentStatus) {
      if (Array.isArray(queryParams.paymentStatus)) {
        filters.paymentStatus = { [Op.in]: queryParams.paymentStatus };
      } else {
        filters.paymentStatus = queryParams.paymentStatus;
      }
    }

    // Transaction ID filter (partial match)
    if (queryParams.transactionId) {
      filters.transactionId = { [Op.iLike]: `%${queryParams.transactionId}%` };
    }

    // Phone number filter
    if (queryParams.phoneNumber) {
      filters.phoneNumber = { [Op.iLike]: `%${queryParams.phoneNumber}%` };
    }

    // Amount range filters
    if (queryParams.minAmount) {
      filters.amount = { ...filters.amount, [Op.gte]: parseFloat(queryParams.minAmount) };
    }
    if (queryParams.maxAmount) {
      filters.amount = { ...filters.amount, [Op.lte]: parseFloat(queryParams.maxAmount) };
    }

    // Date range filters for creation date
    if (queryParams.fromDate) {
      filters.createdAt = { ...filters.createdAt, [Op.gte]: new Date(queryParams.fromDate) };
    }
    if (queryParams.toDate) {
      const toDate = new Date(queryParams.toDate);
      toDate.setHours(23, 59, 59, 999); // End of day
      filters.createdAt = { ...filters.createdAt, [Op.lte]: toDate };
    }

    // Filter for payments with transaction ID
    if (queryParams.hasTransactionId === 'true') {
      filters.transactionId = { [Op.ne]: null };
    } else if (queryParams.hasTransactionId === 'false') {
      filters.transactionId = null;
    }

    // Filter for payments with status message
    if (queryParams.hasStatusMessage === 'true') {
      filters.statusMessage = { [Op.ne]: null };
    } else if (queryParams.hasStatusMessage === 'false') {
      filters.statusMessage = null;
    }

    // Filter for payments with metadata
    if (queryParams.hasMetadata === 'true') {
      filters.metadata = { [Op.ne]: null };
    } else if (queryParams.hasMetadata === 'false') {
      filters.metadata = null;
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;
    
    const validSortFields = [
      'reference', 'amount', 'paymentStatus', 'transactionId', 
      'phoneNumber', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = PaymentFilters;