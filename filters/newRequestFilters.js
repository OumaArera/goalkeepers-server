const { Op } = require('sequelize');

class NewRequestFilters {
  static buildFilters(queryParams) {
    const filters = {};

    // Name filters (case-insensitive partial match)
    if (queryParams.firstName) {
      filters.firstName = { [Op.iLike]: `%${queryParams.firstName}%` };
    }

    if (queryParams.middleNames) {
      filters.middleNames = { [Op.iLike]: `%${queryParams.middleNames}%` };
    }

    if (queryParams.lastNames) {
      filters.lastNames = { [Op.iLike]: `%${queryParams.lastNames}%` };
    }

    // Email filter (case-insensitive partial match)
    if (queryParams.email) {
      filters.email = { [Op.iLike]: `%${queryParams.email}%` };
    }

    // Phone number filter (partial match)
    if (queryParams.phoneNumber) {
      filters.phoneNumber = { [Op.like]: `%${queryParams.phoneNumber}%` };
    }

    // Recent club filter (case-insensitive partial match)
    if (queryParams.recentClub) {
      filters.recentClub = { [Op.iLike]: `%${queryParams.recentClub}%` };
    }

    // Status filter (exact match)
    if (queryParams.status) {
      filters.status = queryParams.status;
    }

    // Age range filters (calculated from date of birth)
    if (queryParams.minAge || queryParams.maxAge) {
      const today = new Date();
      
      if (queryParams.minAge) {
        const maxBirthDate = new Date(today.getFullYear() - parseInt(queryParams.minAge), today.getMonth(), today.getDate());
        filters.dateOfBirth = { ...filters.dateOfBirth, [Op.lte]: maxBirthDate };
      }
      
      if (queryParams.maxAge) {
        const minBirthDate = new Date(today.getFullYear() - parseInt(queryParams.maxAge) - 1, today.getMonth(), today.getDate());
        filters.dateOfBirth = { ...filters.dateOfBirth, [Op.gte]: minBirthDate };
      }
    }

    // Height range filters
    if (queryParams.minHeight) {
      filters.height = { ...filters.height, [Op.gte]: parseFloat(queryParams.minHeight) };
    }
    if (queryParams.maxHeight) {
      filters.height = { ...filters.height, [Op.lte]: parseFloat(queryParams.maxHeight) };
    }

    // Weight range filters
    if (queryParams.minWeight) {
      filters.weight = { ...filters.weight, [Op.gte]: parseFloat(queryParams.minWeight) };
    }
    if (queryParams.maxWeight) {
      filters.weight = { ...filters.weight, [Op.lte]: parseFloat(queryParams.maxWeight) };
    }

    // Clubs played for range filters
    if (queryParams.minClubs) {
      filters.clubsPlayedFor = { ...filters.clubsPlayedFor, [Op.gte]: parseInt(queryParams.minClubs) };
    }
    if (queryParams.maxClubs) {
      filters.clubsPlayedFor = { ...filters.clubsPlayedFor, [Op.lte]: parseInt(queryParams.maxClubs) };
    }

    // Years of goalkeeping experience range filters
    if (queryParams.minExperience) {
      filters.yearsOfGoalkeeping = { ...filters.yearsOfGoalkeeping, [Op.gte]: parseInt(queryParams.minExperience) };
    }
    if (queryParams.maxExperience) {
      filters.yearsOfGoalkeeping = { ...filters.yearsOfGoalkeeping, [Op.lte]: parseInt(queryParams.maxExperience) };
    }

    // Next of kin filters
    if (queryParams.nextOfKinName) {
      filters.nextOfKinName = { [Op.iLike]: `%${queryParams.nextOfKinName}%` };
    }

    if (queryParams.nextOfKinEmail) {
      filters.nextOfKinEmail = { [Op.iLike]: `%${queryParams.nextOfKinEmail}%` };
    }

    if (queryParams.nextOfKinPhoneNumber) {
      filters.nextOfKinPhoneNumber = { [Op.like]: `%${queryParams.nextOfKinPhoneNumber}%` };
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

    // Filter for requests with next of kin information
    if (queryParams.hasNextOfKin === 'true') {
      filters[Op.or] = [
        { nextOfKinName: { [Op.ne]: null } },
        { nextOfKinEmail: { [Op.ne]: null } },
        { nextOfKinPhoneNumber: { [Op.ne]: null } }
      ];
    } else if (queryParams.hasNextOfKin === 'false') {
      filters.nextOfKinName = null;
      filters.nextOfKinEmail = null;
      filters.nextOfKinPhoneNumber = null;
    }

    return filters;
  }

  static buildSortOptions(queryParams) {
    const { sortBy = 'createdAt', sortOrder = 'DESC' } = queryParams;
    
    const validSortFields = [
      'firstName', 'lastNames', 'dateOfBirth', 'height', 'weight', 
      'phoneNumber', 'email', 'clubsPlayedFor', 'recentClub', 
      'yearsOfGoalkeeping', 'status', 'createdAt', 'updatedAt'
    ];
    
    const validSortOrders = ['ASC', 'DESC'];

    const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) 
      ? sortOrder.toUpperCase() 
      : 'DESC';

    return [[field, order]];
  }
}

module.exports = NewRequestFilters;