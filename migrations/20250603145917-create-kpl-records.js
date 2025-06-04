'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('kpl_records', {
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
      club: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      position: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      appearances: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      clean_sheets: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('kpl_records');
  }
};
