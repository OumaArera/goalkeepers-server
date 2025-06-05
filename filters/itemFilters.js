const { Op } = require('sequelize');
const { validate: isUuid } = require('uuid');

class ItemFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Name filter (case-insensitive partial match)
    if (queryParams.name) {
      filters.name = { [Op.iLike]: `%${queryParams.name}%` };
    }

    // Category filter (exact match)
    if (queryParams.category) {
      filters.category = queryParams.category;
    }

    // Brand filter (case-insensitive partial match)
    if (queryParams.brand) {
      filters.brand = { [Op.iLike]: `%${queryParams.brand}%` };
    }

    // Team filter (case-insensitive partial match)
    if (queryParams.team) {
      filters.team = { [Op.iLike]: `%${queryParams.team}%` };
    }

    // Color filter (case-insensitive partial match)
    if (queryParams.color) {
      filters.color = { [Op.iLike]: `%${queryParams.color}%` };
    }

    // Material filter (case-insensitive partial match)
    if (queryParams.material) {
      filters.material = { [Op.iLike]: `%${queryParams.material}%` };
    }

    // Player name filter (case-insensitive partial match)
    if (queryParams.playerName) {
      filters.playerName = { [Op.iLike]: `%${queryParams.playerName}%` };
    }

    // Player number filter (exact match)
    if (queryParams.playerNumber) {
      filters.playerNumber = queryParams.playerNumber;
    }

    // Availability filter
    if (queryParams.available !== undefined) {
      filters.available = queryParams.available === 'true';
    }

    // Price range filters
    if (queryParams.minPrice) {
      filters.price = { ...filters.price, [Op.gte]: parseFloat(queryParams.minPrice) };
    }
    if (queryParams.maxPrice) {
      filters.price = { ...filters.price, [Op.lte]: parseFloat(queryParams.maxPrice) };
    }

    // Discount filter
    if (queryParams.hasDiscount === 'true') {
      filters.discount = { [Op.gt]: 0 };
    }

    // Promoter ID filter with UUID validation
    if (queryParams.promoterId !== undefined) {
      if (queryParams.promoterId === '' || queryParams.promoterId === 'null') {
        filters.promoterId = null;
      } else if (isUuid(queryParams.promoterId)) {
        filters.promoterId = queryParams.promoterId;
      }
      // Invalid UUIDs are ignored (no filter applied)
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;
    
    const validSortFields = [
      'name', 'price', 'quantity', 'category', 'brand', 
      'discount', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = ItemFilters;