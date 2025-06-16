'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ticket_repos', 'price');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('ticket_repos', 'price', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },
};
