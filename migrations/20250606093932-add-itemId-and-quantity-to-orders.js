'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add item_id column
    await queryInterface.addColumn('orders', 'item_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add quantity column
    await queryInterface.addColumn('orders', 'quantity', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove quantity column
    await queryInterface.removeColumn('orders', 'quantity');

    // Remove item_id column
    await queryInterface.removeColumn('orders', 'item_id');
  }
};
