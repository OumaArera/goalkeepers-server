const { Op } = require('sequelize');

class TicketRepoFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Match filter (case-insensitive partial match)
    if (queryParams.match) {
      filters.match = { [Op.iLike]: `%${queryParams.match}%` };
    }

    // Venue filter (case-insensitive partial match)
    if (queryParams.venue) {
      filters.venue = { [Op.iLike]: `%${queryParams.venue}%` };
    }


    // Date range filters
    if (queryParams.startDate || queryParams.endDate) {
      const dateFilter = {};
      
      if (queryParams.startDate) {
        dateFilter[Op.gte] = queryParams.startDate;
      }
      
      if (queryParams.endDate) {
        dateFilter[Op.lte] = queryParams.endDate;
      }
      
      filters.date = dateFilter;
    }

    // Filter for upcoming tickets only
    if (queryParams.upcomingOnly === 'true') {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      filters.date = { ...filters.date, [Op.gte]: today };
    }

    // Filter for past tickets only
    if (queryParams.pastOnly === 'true') {
      const today = new Date().toISOString().split('T')[0];
      filters.date = { ...filters.date, [Op.lt]: today };
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'date', sortOrder = 'ASC' } = queryParams;
    
    const validSortFields = [
      'match', 'venue', 'date', 
      'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'date';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'ASC';

    return [[field, order]];
  }

  static buildSearchFilters(searchTerm) {
    if (!searchTerm) return {};

    return {
      [Op.or]: [
        { match: { [Op.iLike]: `%${searchTerm}%` } },
        { venue: { [Op.iLike]: `%${searchTerm}%` } },
      ]
    };
  }

  static buildAdvancedFilters(queryParams) {
    const filters = this.buildFilters(queryParams);

    // Add search functionality
    if (queryParams.search) {
      const searchFilters = this.buildSearchFilters(queryParams.search);
      Object.assign(filters, searchFilters);
    }


    // This week's matches
    if (queryParams.thisWeek === 'true') {
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
      
      filters.date = {
        [Op.between]: [
          weekStart.toISOString().split('T')[0],
          weekEnd.toISOString().split('T')[0]
        ]
      };
    }

    // This month's matches
    if (queryParams.thisMonth === 'true') {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      filters.date = {
        [Op.between]: [
          monthStart.toISOString().split('T')[0],
          monthEnd.toISOString().split('T')[0]
        ]
      };
    }

    return filters;
  }
}

module.exports = TicketRepoFilters;