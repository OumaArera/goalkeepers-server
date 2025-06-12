const { Op } = require('sequelize');

class OrderFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Customer ID filter
    if (queryParams.customerId) {
      filters.customerId = queryParams.customerId;
    }

    // Order number filter (partial match)
    if (queryParams.orderNumber) {
      filters.orderNumber = { [Op.iLike]: `%${queryParams.orderNumber}%` };
    }

    // Status filter
    if (queryParams.status) {
      if (Array.isArray(queryParams.status)) {
        filters.status = { [Op.in]: queryParams.status };
      } else {
        filters.status = queryParams.status;
      }
    }

    // Delivery method filter
    if (queryParams.deliveryMethod) {
      filters.deliveryMethod = queryParams.deliveryMethod;
    }

    // Payment method filter
    if (queryParams.paymentMethod) {
      filters.paymentMethod = queryParams.paymentMethod;
    }

    // Payment status filter
    if (queryParams.paymentStatus) {
      if (Array.isArray(queryParams.paymentStatus)) {
        filters.paymentStatus = { [Op.in]: queryParams.paymentStatus };
      } else {
        filters.paymentStatus = queryParams.paymentStatus;
      }
    }

    // Total amount range filters
    if (queryParams.minAmount) {
      filters.totalAmount = { ...filters.totalAmount, [Op.gte]: parseFloat(queryParams.minAmount) };
    }
    if (queryParams.maxAmount) {
      filters.totalAmount = { ...filters.totalAmount, [Op.lte]: parseFloat(queryParams.maxAmount) };
    }

    // Grand total range filters
    if (queryParams.minGrandTotal) {
      filters.grandTotal = { ...filters.grandTotal, [Op.gte]: parseFloat(queryParams.minGrandTotal) };
    }
    if (queryParams.maxGrandTotal) {
      filters.grandTotal = { ...filters.grandTotal, [Op.lte]: parseFloat(queryParams.maxGrandTotal) };
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

    // Delivered date range filters
    if (queryParams.deliveredFromDate) {
      filters.deliveredAt = { ...filters.deliveredAt, [Op.gte]: new Date(queryParams.deliveredFromDate) };
    }
    if (queryParams.deliveredToDate) {
      const toDate = new Date(queryParams.deliveredToDate);
      toDate.setHours(23, 59, 59, 999);
      filters.deliveredAt = { ...filters.deliveredAt, [Op.lte]: toDate };
    }

    // Filter for orders with notes
    if (queryParams.hasNotes === 'true') {
      filters.notes = { [Op.ne]: null };
    } else if (queryParams.hasNotes === 'false') {
      filters.notes = null;
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;
    
    const validSortFields = [
      'orderNumber', 'status', 'deliveryMethod', 'totalAmount', 'grandTotal',
      'paymentMethod', 'paymentStatus', 'deliveredAt', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = OrderFilters;