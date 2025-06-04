'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('honors_and_awards', {
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
      title: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      month_awarded: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      season: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    await queryInterface.dropTable('honors_and_awards');
  }
};
