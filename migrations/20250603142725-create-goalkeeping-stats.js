'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goalkeeping_stats', {
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
      saves: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      penalties_saved: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      punches: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      high_claims: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      catches: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      sweeper_clearances: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      throw_outs: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      goal_kicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('goalkeeping_stats');
  }
};
