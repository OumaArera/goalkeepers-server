'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ticket_repos', 'category');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('ticket_repos', 'category', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },
};
