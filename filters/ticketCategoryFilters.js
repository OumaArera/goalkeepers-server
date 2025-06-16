const { Op } = require('sequelize');
const { validate: isUuid } = require('uuid');

class TicketCategoryFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Ticket Repository ID filter (exact match)
    if (queryParams.ticketRepoId && isUuid(queryParams.ticketRepoId)) {
      filters.ticketRepoId = queryParams.ticketRepoId;
    }

    // Category filter (exact match)
    if (queryParams.category) {
      filters.category = queryParams.category;
    }

    // Multiple categories filter
    if (queryParams.categories) {
      const categoriesArray = Array.isArray(queryParams.categories) 
        ? queryParams.categories 
        : queryParams.categories.split(',');
      
      const validCategories = categoriesArray.filter(cat => 
        ['VIP', 'VVIP', 'Regular'].includes(cat)
      );
      
      if (validCategories.length > 0) {
        filters.category = { [Op.in]: validCategories };
      }
    }

    // Price range filters
    if (queryParams.minPrice) {
      filters.price = { ...filters.price, [Op.gte]: parseFloat(queryParams.minPrice) };
    }
    if (queryParams.maxPrice) {
      filters.price = { ...filters.price, [Op.lte]: parseFloat(queryParams.maxPrice) };
    }

    // Exact price filter
    if (queryParams.price) {
      filters.price = parseFloat(queryParams.price);
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'price', sortOrder = 'ASC' } = queryParams;
    
    const validSortFields = [
      'category', 'price', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'price';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'ASC';

    return [[field, order]];
  }

  static buildIncludeOptions(queryParams) {
    const includeOptions = [];

    // Always include event details, but can be configured
    if (queryParams.includeEvent !== 'false') {
      const eventInclude = {
        model: require('../models').TicketRepo,
        as: 'event',
        attributes: ['id', 'match', 'venue', 'date']
      };

      // Add event filters if provided
      if (queryParams.eventMatch || queryParams.eventVenue || queryParams.eventDate) {
        const eventWhere = {};

        if (queryParams.eventMatch) {
          eventWhere.match = { [Op.iLike]: `%${queryParams.eventMatch}%` };
        }

        if (queryParams.eventVenue) {
          eventWhere.venue = { [Op.iLike]: `%${queryParams.eventVenue}%` };
        }

        if (queryParams.eventDate) {
          eventWhere.date = queryParams.eventDate;
        }

        eventInclude.where = eventWhere;
        eventInclude.required = true; // Inner join to filter results
      }

      includeOptions.push(eventInclude);
    }

    return includeOptions;
  }

  static buildAdvancedFilters(queryParams) {
    const filters = this.buildFilters(queryParams);

    // Price category filters (budget, mid-range, premium)
    if (queryParams.priceCategory) {
      switch (queryParams.priceCategory) {
        case 'budget':
          filters.price = { [Op.lte]: 100 };
          break;
        case 'mid-range':
          filters.price = { [Op.between]: [100, 500] };
          break;
        case 'premium':
          filters.price = { [Op.gte]: 500 };
          break;
      }
    }

    // Category hierarchy filter (useful for pricing displays)
    if (queryParams.categoryHierarchy === 'true') {
      // This would be used in combination with sorting by a custom field
      // that represents category hierarchy (Regular=1, VIP=2, VVIP=3)
      filters.categoryOrder = {
        [Op.in]: [
          { category: 'Regular', order: 1 },
          { category: 'VIP', order: 2 },
          { category: 'VVIP', order: 3 }
        ]
      };
    }

    // Available for upcoming events only
    if (queryParams.upcomingEventsOnly === 'true') {
      // This filter would need to be applied at the include level
      // Will be handled in buildIncludeOptions
    }

    return filters;
  }

  static buildGroupingOptions(queryParams) {
    const groupOptions = [];

    // Group by category for statistical purposes
    if (queryParams.groupByCategory === 'true') {
      groupOptions.push('category');
    }

    // Group by event for category comparison
    if (queryParams.groupByEvent === 'true') {
      groupOptions.push('ticketRepoId');
    }

    return groupOptions.length > 0 ? groupOptions : null;
  }

  static buildAggregationFilters(queryParams) {
    // For statistical queries
    const aggregations = {};

    if (queryParams.includeStats === 'true') {
      aggregations.priceStats = {
        min: { [Op.min]: 'price' },
        max: { [Op.max]: 'price' },
        avg: { [Op.avg]: 'price' }
      };
    }

    if (queryParams.categoryCount === 'true') {
      aggregations.categoryCount = {
        [Op.count]: 'category'
      };
    }

    return Object.keys(aggregations).length > 0 ? aggregations : null;
  }

  static buildCompleteQuery(queryParams) {
    return {
      where: this.buildAdvancedFilters(queryParams),
      include: this.buildIncludeOptions(queryParams),
      order: this.buildSortOptions(queryParams),
      group: this.buildGroupingOptions(queryParams)
    };
  }

  // Helper method to validate price ranges
  static validatePriceRange(minPrice, maxPrice) {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (minPrice && maxPrice && min > max) {
      throw new Error('Minimum price cannot be greater than maximum price');
    }

    if (minPrice && min < 0) {
      throw new Error('Minimum price cannot be negative');
    }

    if (maxPrice && max < 0) {
      throw new Error('Maximum price cannot be negative');
    }

    return true;
  }

  // Helper method to get category priority for sorting
  static getCategoryPriority(category) {
    const priorities = {
      'Regular': 1,
      'VIP': 2,
      'VVIP': 3
    };
    return priorities[category] || 0;
  }
}

module.exports = TicketCategoryFilters;