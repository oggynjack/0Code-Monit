/**
 * Add Google OAuth support
 * Adds google_id column to user table (idempotent)
 */

exports.up = async function(knex) {
    const exists = await knex.schema.hasColumn("user", "google_id");
    if (!exists) {
        return knex.schema.table("user", function(table) {
            table.string("google_id", 100).nullable().unique();
        });
    }
};

exports.down = async function(knex) {
    // No-op for SQLite (DROP COLUMN not reliably supported in older versions)
};
