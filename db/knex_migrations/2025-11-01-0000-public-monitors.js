/**
 * Create public_monitor and public_status_page tables for free tier users
 */

exports.up = function(knex) {
    return knex.schema
        .createTable("public_monitor", function(table) {
            table.increments("id").primary();
            table.integer("user_id").unsigned().notNullable();
            table.string("name", 255).notNullable();
            table.string("url", 500).notNullable();
            table.integer("interval").notNullable().defaultTo(60);
            table.string("status", 50).defaultTo("pending");
            table.integer("response_time").defaultTo(0);
            table.string("webhook", 500).nullable();
            table.datetime("created_at").notNullable();
            table.datetime("last_check").nullable();
            
            table.index("user_id");
            table.foreign("user_id").references("user.id").onDelete("CASCADE");
        })
        .createTable("public_status_page", function(table) {
            table.increments("id").primary();
            table.integer("user_id").unsigned().notNullable();
            table.string("slug", 50).notNullable().unique();
            table.datetime("created_at").notNullable();
            
            table.index("user_id");
            table.index("slug");
            table.foreign("user_id").references("user.id").onDelete("CASCADE");
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists("public_status_page")
        .dropTableIfExists("public_monitor");
};
