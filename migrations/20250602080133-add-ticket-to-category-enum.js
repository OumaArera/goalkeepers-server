'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('items', 'category', {
      type: Sequelize.ENUM('jersey', 'gloves', 'accessory', 'ticket'),
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('items', 'category', {
      type: Sequelize.ENUM('jersey', 'gloves', 'accessory'),
      allowNull: false,
    });
  }
};
