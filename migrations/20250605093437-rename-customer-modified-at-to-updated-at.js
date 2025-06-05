'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename `modified_at` to `updated_at` in the users table
    return queryInterface.renameColumn('customers', 'modified_at', 'updated_at');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the column name if rolling back
    return queryInterface.renameColumn('customers', 'updated_at', 'modified_at');
  }
};
