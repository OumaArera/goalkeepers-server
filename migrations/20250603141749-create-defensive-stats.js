'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('defensive_stats', {
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
      clean_sheets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      goals_conceded: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      errors_leading_to_goal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      own_goals: {
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('defensive_stats');
  }
};
