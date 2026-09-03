const Database = require("../server/database");
const { R } = require("redbean-node");
const args = require("args-parser")(process.argv);
const { log } = require("../src/util");

const main = async () => {
    log.info("migration", "Starting manual user table migration...");

    // Initialize database
    Database.initDataDir(args);
    await Database.connect();

    try {
        log.info("migration", "Adding email column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN email VARCHAR(255)");
            log.info("migration", "✓ email column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ email column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding tier column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN tier VARCHAR(20) DEFAULT 'free' NOT NULL");
            log.info("migration", "✓ tier column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ tier column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding max_monitors column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN max_monitors INTEGER DEFAULT 3 NOT NULL");
            log.info("migration", "✓ max_monitors column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ max_monitors column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding max_status_pages column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN max_status_pages INTEGER DEFAULT 1 NOT NULL");
            log.info("migration", "✓ max_status_pages column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ max_status_pages column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding email_verified column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN email_verified BOOLEAN DEFAULT 0 NOT NULL");
            log.info("migration", "✓ email_verified column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ email_verified column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding verification_token column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN verification_token VARCHAR(100)");
            log.info("migration", "✓ verification_token column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ verification_token column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding reset_otp column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN reset_otp VARCHAR(10)");
            log.info("migration", "✓ reset_otp column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ reset_otp column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Adding reset_otp_expiry column...");
        try {
            await R.exec("ALTER TABLE user ADD COLUMN reset_otp_expiry BIGINT");
            log.info("migration", "✓ reset_otp_expiry column added");
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                log.info("migration", "✓ reset_otp_expiry column already exists");
            } else {
                throw e;
            }
        }

        log.info("migration", "Updating existing users to admin tier...");
        await R.exec("UPDATE user SET tier = 'admin', max_monitors = 999999, max_status_pages = 999999");
        log.info("migration", "✓ Existing users updated");

        log.info("migration", "✅ Migration completed successfully!");
        log.info("migration", "You can now restart the server.");

    } catch (e) {
        log.error("migration", "Migration failed: " + e.message);
        log.error("migration", e.stack);
        process.exit(1);
    } finally {
        await Database.close();
    }
};

main();
