'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('orders', 'item_id');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('orders', 'item_id', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  }
};
