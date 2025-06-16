const { Op } = require('sequelize');

class TicketFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Event ID filter
    if (queryParams.eventId) {
      filters.eventId = queryParams.eventId;
    }

    // Ticket number filter (partial match)
    if (queryParams.ticketNumber) {
      filters.ticketNumber = { [Op.iLike]: `%${queryParams.ticketNumber}%` };
    }

    // Category filter
    if (queryParams.category) {
      if (Array.isArray(queryParams.category)) {
        filters.category = { [Op.in]: queryParams.category };
      } else {
        filters.category = queryParams.category;
      }
    }

    // Status filter
    if (queryParams.status) {
      if (Array.isArray(queryParams.status)) {
        filters.status = { [Op.in]: queryParams.status };
      } else {
        filters.status = queryParams.status;
      }
    }

    // Phone number filter
    if (queryParams.phoneNumber) {
      filters.phoneNumber = { [Op.iLike]: `%${queryParams.phoneNumber}%` };
    }

    // Full name filter
    if (queryParams.fullName) {
      filters.fullName = { [Op.iLike]: `%${queryParams.fullName}%` };
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

    // Filter for tickets with QR code
    if (queryParams.hasQrCode === 'true') {
      filters.qrCode = { [Op.ne]: null };
    } else if (queryParams.hasQrCode === 'false') {
      filters.qrCode = null;
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;
    
    const validSortFields = [
      'ticketNumber', 'amount', 'category', 'status', 
      'phoneNumber', 'fullName', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = TicketFilters;