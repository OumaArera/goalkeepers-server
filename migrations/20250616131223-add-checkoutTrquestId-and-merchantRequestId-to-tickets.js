'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tickets', 'checkout_request_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('tickets', 'merchant_request_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tickets', 'checkout_request_id');
    await queryInterface.removeColumn('tickets', 'merchant_request_id');
  }
};