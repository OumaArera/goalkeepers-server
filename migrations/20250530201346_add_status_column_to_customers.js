exports.up = function(knex) {
  return knex.schema.alterTable('customers', function(table) {
    table.string('status').notNullable().defaultTo('active');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('customers', function(table) {
    table.dropColumn('status');
  });
};
