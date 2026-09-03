const ColumnCompilerMySQL = require("knex/lib/dialects/mysql/schema/mysql-columncompiler");
const { formatDefault } = require("knex/lib/formatter/formatterUtils");
const { log } = require("../../../../../../../src/util");

class CodeMonitColumnCompiler extends ColumnCompilerMySQL {
    /**
     * Override defaultTo method to handle default value for TEXT fields
     * @param {any} value Value
     * @returns {string|void} Default value (Don't understand why it can return void or string, but it's the original code, lol)
     */
    defaultTo(value) {
        if (this.type === "text") {
            // TiDB and standard MySQL do not support default expressions on TEXT columns.
            // JavaScript models already initialize defaults on insert.
            return "";
        }
        return super.defaultTo.apply(this, arguments);
    }
}

module.exports = CodeMonitColumnCompiler;
