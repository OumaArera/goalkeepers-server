const { Op } = require('sequelize');

class CustomerFilters {
  static buildFilters(query) {
    const filters = {};
    
    if (query.firstName) {
      filters.firstName = { [Op.iLike]: `%${query.firstName}%` };
    }
    
    if (query.lastName) {
      filters.lastName = { [Op.iLike]: `%${query.lastName}%` };
    }
    
    if (query.email) {
      filters.email = { [Op.iLike]: `%${query.email}%` };
    }
    
    if (query.phoneNumber) {
      filters.phoneNumber = { [Op.iLike]: `%${query.phoneNumber}%` };
    }
    
    if (query.status) {
      filters.status = query.status;
    }

    // Name search that searches both first and last names
    if (query.name) {
      filters[Op.or] = [
        { firstName: { [Op.iLike]: `%${query.name}%` } },
        { lastName: { [Op.iLike]: `%${query.name}%` } },
      ];
    }

    // Date range filters
    if (query.createdAfter) {
      filters.createdAt = { [Op.gte]: new Date(query.createdAfter) };
    }

    if (query.createdBefore) {
      filters.createdAt = {
        ...filters.createdAt,
        [Op.lte]: new Date(query.createdBefore)
      };
    }

    return filters;
  }

  static buildSortOptions(query) {
    const sortOptions = [];
    
    if (query.sortBy) {
      const sortDirection = query.sortOrder === 'asc' ? 'ASC' : 'DESC';
      
      // Define allowed sort fields for security
      const allowedSortFields = [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'status',
        'createdAt',
        'updatedAt'
      ];

      if (allowedSortFields.includes(query.sortBy)) {
        sortOptions.push([query.sortBy, sortDirection]);
      }
    }

    // Default sort if no valid sort specified
    if (sortOptions.length === 0) {
      sortOptions.push(['createdAt', 'DESC']);
    }

    return sortOptions;
  }
}

module.exports = CustomerFilters;