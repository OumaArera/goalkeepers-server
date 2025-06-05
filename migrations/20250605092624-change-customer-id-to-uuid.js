'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Add a new UUID column
    await queryInterface.addColumn('customers', 'uuid_temp', {
      type: Sequelize.UUID,
      defaultValue: Sequelize.literal('(gen_random_uuid())'),
      allowNull: false,
    });

    // 2. For MySQL or SQLite (no `gen_random_uuid()`):
    // Update each row with a generated UUID
    const [customers] = await queryInterface.sequelize.query('SELECT id FROM customers');
    for (const customer of customers) {
      await queryInterface.sequelize.query(
        `UPDATE customers SET uuid_temp = '${uuidv4()}' WHERE id = ${customer.id}`
      );
    }

    // 3. Drop foreign key constraints if any (do this BEFORE dropping the old id)

    // 4. Drop the old primary key column
    await queryInterface.removeColumn('customers', 'id');

    // 5. Rename new column to id and set as primary key
    await queryInterface.renameColumn('customers', 'uuid_temp', 'id');

    await queryInterface.changeColumn('customers', 'id', {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('customers', 'id');

    await queryInterface.addColumn('customers', 'id', {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    });
  },
};
