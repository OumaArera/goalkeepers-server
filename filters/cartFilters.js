const { Op } = require('sequelize');

class CartFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Customer ID filter
    if (queryParams.customerId) {
      filters.customerId = queryParams.customerId;
    }

    // Item ID filter
    if (queryParams.itemId) {
      filters.itemId = queryParams.itemId;
    }

    // Status filter
    if (queryParams.status) {
      if (Array.isArray(queryParams.status)) {
        filters.status = { [Op.in]: queryParams.status };
      } else {
        filters.status = queryParams.status;
      }
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

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;
    
    const validSortFields = [
      'customerId', 'itemId', 'status', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = CartFilters;