'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Change status_message from JSON to STRING
    await queryInterface.changeColumn('payments', 'status_message', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Add checkout_request_id
    await queryInterface.addColumn('payments', 'checkout_request_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // 3. Add merchant_request_id
    await queryInterface.addColumn('payments', 'merchant_request_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    // 4. Remove card_number
    await queryInterface.removeColumn('payments', 'cardNumber');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert status_message to JSON
    await queryInterface.changeColumn('payments', 'status_message', {
      type: Sequelize.JSON,
      allowNull: true,
    });

    // Remove added columns
    await queryInterface.removeColumn('payments', 'checkout_request_id');
    await queryInterface.removeColumn('payments', 'merchant_request_id');

    // Restore card_number
    await queryInterface.addColumn('payments', 'cardNumber', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
