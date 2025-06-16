'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tickets', 'full_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('tickets', 'full_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
