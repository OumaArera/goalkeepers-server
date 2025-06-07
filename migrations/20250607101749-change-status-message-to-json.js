'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      ALTER COLUMN status_message
      TYPE JSON
      USING status_message::json;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE payments
      ALTER COLUMN status_message
      TYPE VARCHAR
      USING status_message::text;
    `);
  }
};
