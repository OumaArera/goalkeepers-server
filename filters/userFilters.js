const { Op } = require('sequelize');

class UserFilters {
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
    
    if (query.role) {
      filters.role = query.role;
    }
    
    if (query.department) {
      filters.department = query.department;
    }
    
    if (query.status) {
      filters.status = query.status;
    }

    // Additional filters for more complex queries
    if (query.nationalIdOrPassportNo) {
      filters.nationalIdOrPassportNo = { [Op.iLike]: `%${query.nationalIdOrPassportNo}%` };
    }

    if (query.phonenumber) {
      filters.phonenumber = { [Op.iLike]: `%${query.phonenumber}%` };
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
        'role',
        'department',
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

module.exports = UserFilters;