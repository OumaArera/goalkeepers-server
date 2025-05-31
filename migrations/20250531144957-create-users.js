'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()')
      },
      first_name: { type: Sequelize.STRING, allowNull: false },
      middle_names: { type: Sequelize.STRING },
      last_name: { type: Sequelize.STRING, allowNull: false },
      date_of_birth: { type: Sequelize.DATEONLY, allowNull: false },
      national_id_or_passport_no: { type: Sequelize.STRING, unique: true, allowNull: false },
      role: {
        type: Sequelize.ENUM('superuser', 'manager', 'player', 'junior', 'director'),
        allowNull: false,
      },
      department: {
        type: Sequelize.ENUM('Sales', 'Analysis', 'Services', 'Donors', 'IT', 'Players', 'Management'),
        allowNull: false,
      },
      phone_number: { type: Sequelize.STRING, unique: true, allowNull: false },
      email: { type: Sequelize.STRING, unique: true, allowNull: false },
      password: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.ENUM('active', 'blocked', 'suspended', 'deleted'),
        defaultValue: 'active',
      },
      avatar: { type: Sequelize.STRING },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      modified_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_role');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_department');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_users_status');
  }
};
