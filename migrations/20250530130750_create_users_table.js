/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('first_name').notNullable();
    table.string('middle_names');
    table.string('last_name').notNullable();
    table.date('date_of_birth').notNullable();
    table.string('national_id_or_passport_no').notNullable().unique();
    table.string('role').notNullable().checkIn([
      'superuser', 
      'manager', 
      'player', 
      'junior', 
      'director'
    ]);
    table.string('department').notNullable().checkIn([
      'Sales',
      'Analysis',
      'Services',
      'Donors',
      'IT',
      'Players',
      'Management'
    ]);

    table.string('phone_number').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.enu('status', ['active', 'blocked', 'suspended', 'deleted'], { useNative: true, enumName: 'user_status' }).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('users');
  await knex.raw('DROP TYPE IF EXISTS user_status');
};
