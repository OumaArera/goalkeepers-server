'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('goalkeepers', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Ensure this table exists before running the migration
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      height: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      weight: {
        type: Sequelize.DECIMAL,
        allowNull: true,
      },
      favorite_foot: {
        type: Sequelize.ENUM('Right', 'Left', 'Both'),
        allowNull: true,
      },
      jersey: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      international_caps: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      image_url: {
        type: Sequelize.TEXT,
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('goalkeepers');
  }
};
