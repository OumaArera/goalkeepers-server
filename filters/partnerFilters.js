const { Op } = require('sequelize');

class PartnerFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Name filter (case-insensitive partial match)
    if (queryParams.name) {
      filters.name = { [Op.iLike]: `%${queryParams.name}%` };
    }

    // Slogan filter (case-insensitive partial match)
    if (queryParams.slogan) {
      filters.slogan = { [Op.iLike]: `%${queryParams.slogan}%` };
    }

    // Website URL filter (case-insensitive partial match)
    if (queryParams.websiteUrl) {
      filters.websiteUrl = { [Op.iLike]: `%${queryParams.websiteUrl}%` };
    }

    // Filter for partners with website URL
    if (queryParams.hasWebsite === 'true') {
      filters.websiteUrl = { [Op.ne]: null };
    } else if (queryParams.hasWebsite === 'false') {
      filters.websiteUrl = null;
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
      'name', 'slogan', 'websiteUrl', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = PartnerFilters;