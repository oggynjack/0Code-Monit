/**
 * Map monitors to public status pages
 */

exports.up = function(knex) {
  return knex.schema.createTable('public_status_page_monitor', function(table) {
    table.increments('id').primary();
    table.integer('status_page_id').unsigned().notNullable();
    table.integer('monitor_id').unsigned().notNullable();
    table.unique(['status_page_id', 'monitor_id']);
    table.foreign('status_page_id').references('public_status_page.id').onDelete('CASCADE');
    table.foreign('monitor_id').references('public_monitor.id').onDelete('CASCADE');
    table.index(['status_page_id']);
    table.index(['monitor_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('public_status_page_monitor');
};
