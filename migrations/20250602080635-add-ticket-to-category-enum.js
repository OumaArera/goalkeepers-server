'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'ticket' to the existing enum type
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_items_category"
      ADD VALUE IF NOT EXISTS 'ticket';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Cannot remove values from PostgreSQL enums directly
    // So we have to recreate the enum type without 'ticket'
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_items_category_new" AS ENUM ('jersey', 'gloves', 'accessory');
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE "items"
        ALTER COLUMN "category" TYPE "enum_items_category_new"
        USING "category"::text::"enum_items_category_new";
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP TYPE "enum_items_category";
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_items_category_new" RENAME TO "enum_items_category";
      `, { transaction });
    });
  }
};
