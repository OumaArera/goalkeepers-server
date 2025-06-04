'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('teamplay_stats', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
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
      goals: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      assists: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      passes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      passes_per_match: {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      accurate_long_balls: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now'),
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('teamplay_stats');
  }
};
