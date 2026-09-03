const Database = require("../server/database");
const { R } = require("redbean-node");
const args = require("args-parser")(process.argv);
const { log } = require("../src/util");

const main = async () => {
    log.info("migration", "Adding google_id column to user table...");

    Database.initDataDir(args);
    await Database.connect();

    try {
        await R.exec("ALTER TABLE user ADD COLUMN google_id VARCHAR(100)");
        log.info("migration", "✓ google_id column added successfully");
    } catch (e) {
        if (e.message.includes("duplicate column name")) {
            log.info("migration", "✓ google_id column already exists");
        } else {
            throw e;
        }
    } finally {
        await Database.close();
    }
};

main();
