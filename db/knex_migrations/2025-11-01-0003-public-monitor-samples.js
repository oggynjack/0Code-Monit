/**
 * Store sample checks for public monitors for history/uptime charts
 */

exports.up = function(knex) {
  return knex.schema.createTable('public_monitor_sample', function(table) {
    table.increments('id').primary();
    table.integer('monitor_id').unsigned().notNullable();
    table.datetime('time').notNullable();
    table.string('status', 20).notNullable();
    table.integer('ping').nullable();
    table.index(['monitor_id']);
    table.index(['time']);
    table.foreign('monitor_id').references('public_monitor.id').onDelete('CASCADE');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('public_monitor_sample');
};