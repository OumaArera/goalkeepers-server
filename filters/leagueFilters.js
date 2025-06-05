const { Op } = require('sequelize');

class LeagueFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Name filter (case-insensitive partial match)
    if (queryParams.name) {
      filters.name = { [Op.iLike]: `%${queryParams.name}%` };
    }

    // Level filter (case-insensitive partial match)
    if (queryParams.level) {
      filters.level = { [Op.iLike]: `%${queryParams.level}%` };
    }

    // Country filter (case-insensitive partial match)
    if (queryParams.country) {
      filters.country = { [Op.iLike]: `%${queryParams.country}%` };
    }

    // Description filter (case-insensitive partial match)
    if (queryParams.description) {
      filters.description = { [Op.iLike]: `%${queryParams.description}%` };
    }

    // Sex filter (exact match)
    if (queryParams.sex) {
      filters.sex = queryParams.sex;
    }

    // Regulator filter (case-insensitive partial match)
    if (queryParams.regulator) {
      filters.regulator = { [Op.iLike]: `%${queryParams.regulator}%` };
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

    // Date range filters for update date
    if (queryParams.fromUpdateDate) {
      filters.updatedAt = { ...filters.updatedAt, [Op.gte]: new Date(queryParams.fromUpdateDate) };
    }
    if (queryParams.toUpdateDate) {
      const toDate = new Date(queryParams.toUpdateDate);
      toDate.setHours(23, 59, 59, 999); // End of day
      filters.updatedAt = { ...filters.updatedAt, [Op.lte]: toDate };
    }

    // Multiple countries filter (for searching across multiple countries)
    if (queryParams.countries && Array.isArray(queryParams.countries)) {
      filters.country = { [Op.in]: queryParams.countries };
    }

    // Multiple levels filter (for searching across multiple levels)
    if (queryParams.levels && Array.isArray(queryParams.levels)) {
      filters.level = { [Op.in]: queryParams.levels };
    }

    // Multiple sex categories filter
    if (queryParams.sexCategories && Array.isArray(queryParams.sexCategories)) {
      filters.sex = { [Op.in]: queryParams.sexCategories };
    }

    // Search across multiple fields (global search)
    if (queryParams.search) {
      const searchTerm = `%${queryParams.search}%`;
      filters[Op.or] = [
        { name: { [Op.iLike]: searchTerm } },
        { level: { [Op.iLike]: searchTerm } },
        { country: { [Op.iLike]: searchTerm } },
        { description: { [Op.iLike]: searchTerm } },
        { regulator: { [Op.iLike]: searchTerm } }
      ];
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'ASC' } = queryParams;
    
    const validSortFields = [
      'name', 'level', 'country', 'sex', 'regulator', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }

  static buildAdvancedFilters(queryParams) {
    const filters = this.buildFilters(queryParams);

    // Add more complex filtering logic here if needed
    // For example, filtering by leagues created in the last N days
    if (queryParams.recentDays) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(queryParams.recentDays));
      filters.createdAt = { ...filters.createdAt, [Op.gte]: daysAgo };
    }

    // Filter by leagues that contain certain keywords in name or description
    if (queryParams.keywords) {
      const keywords = queryParams.keywords.split(',').map(kw => kw.trim());
      const keywordFilters = keywords.map(keyword => ({
        [Op.or]: [
          { name: { [Op.iLike]: `%${keyword}%` } },
          { description: { [Op.iLike]: `%${keyword}%` } }
        ]
      }));
      
      if (keywordFilters.length > 0) {
        filters[Op.and] = keywordFilters;
      }
    }

    return filters;
  }
}

module.exports = LeagueFilters;