'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('discipline_records', {
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
      yellow_cards: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      red_cards: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      fouls: {
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
    await queryInterface.dropTable('discipline_records');
  }
};
