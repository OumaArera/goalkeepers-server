'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Promise.all([
      queryInterface.changeColumn('items', 'brand', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.changeColumn('items', 'size', {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      }),
      queryInterface.changeColumn('items', 'color', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.changeColumn('items', 'material', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.changeColumn('items', 'team', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.changeColumn('items', 'player_name', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.changeColumn('items', 'player_number', {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.changeColumn('items', 'discount', {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      }),
      queryInterface.changeColumn('items', 'available', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // revert to original state if needed
  }
};
