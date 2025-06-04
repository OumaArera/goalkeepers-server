'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('former_clubs', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      goalkeeper_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'goalkeepers',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      country: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      league: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('now'),
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('former_clubs');
  }
};
