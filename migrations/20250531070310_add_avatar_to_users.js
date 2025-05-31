// migrations/XXXX_add_avatar_to_users.js
exports.up = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.string('avatar').nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('users', function (table) {
    table.dropColumn('avatar');
  });
};
