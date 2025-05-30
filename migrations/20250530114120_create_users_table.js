exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('first_name').notNullable();
    table.string('middle_names').nullable();
    table.string('last_name').notNullable();
    table.date('date_of_birth').notNullable();
    table.string('national_id_or_passport_no').notNullable().unique();
    table.string('role').notNullable(); 
    table.string('department').notNullable(); 
    table.string('phone_number').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password').notNullable();
    table.string('status').notNullable().defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('modified_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
