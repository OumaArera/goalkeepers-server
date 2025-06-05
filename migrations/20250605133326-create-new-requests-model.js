'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('new_requests', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      middle_names: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_names: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      height: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      weight: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clubs_played_for: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      recent_club: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      years_of_goalkeeping: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      request_details: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      next_of_kin_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      next_of_kin_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      next_of_kin_phone_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'declined'),
        defaultValue: 'pending',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('new_requests');
  }
};
