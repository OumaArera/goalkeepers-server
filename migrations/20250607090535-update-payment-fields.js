'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payments', 'transaction_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });

    await queryInterface.changeColumn('payments', 'reference', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('payments', 'transaction_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false, // rollback might remove uniqueness constraint
    });

    await queryInterface.changeColumn('payments', 'reference', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false, // rollback to previous state
    });
  },
};
