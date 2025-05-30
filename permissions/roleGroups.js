const roleGroups = {
  ALL_USERS: ['superuser', 'manager', 'director', 'player', 'junior'],
  SUPERUSER: ['superuser'],
  MANAGEMENT: ['superuser', 'manager', 'director'],
  JUNIOR: ['player', 'junior'],
};

module.exports = roleGroups;
