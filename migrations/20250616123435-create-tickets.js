'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        allowNull: false,
      },
      event_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'ticket_repos',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      category: {
        type: Sequelize.ENUM('VIP', 'VVIP', 'Regular'),
        allowNull: false,
      },
      ticket_number: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      qr_code: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      security_hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM('unpaid', 'paid', 'active', 'used', 'revoked'),
        allowNull: false,
        defaultValue: 'paid',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tickets');
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_tickets_category";`);
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_tickets_status";`);
  },
};
