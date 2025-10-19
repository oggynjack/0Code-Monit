exports.up = function (knex) {
    return knex.schema.hasColumn('monitor', 'discord_bot_token').then(function(exists) {
        if (!exists) {
            return knex.schema.alterTable('monitor', function (table) {
                table.text('discord_bot_token').nullable().comment('Discord bot token for bot monitoring');
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.hasColumn('monitor', 'discord_bot_token').then(function(exists) {
        if (exists) {
            return knex.schema.alterTable('monitor', function (table) {
                table.dropColumn('discord_bot_token');
            });
        }
    });
};