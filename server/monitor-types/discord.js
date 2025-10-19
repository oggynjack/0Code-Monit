const { MonitorType } = require("./monitor-type");
const { UP, DOWN } = require("../../src/util");
const axios = require("axios");

class DiscordMonitorType extends MonitorType {
    name = "discord";

    /**
     * Check Discord Bot Status
     * @param {Monitor} monitor Monitor object
     * @param {Heartbeat} heartbeat Heartbeat object
     * @returns {Promise<void>}
     */
    async check(monitor, heartbeat) {
        if (!monitor.discordBotToken) {
            throw new Error("Discord bot token is required");
        }

        try {
            const startTime = Date.now();
            
            // Use Discord API to check if bot is valid and online
            const response = await axios.get("https://discord.com/api/v10/users/@me", {
                headers: {
                    "Authorization": `Bot ${monitor.discordBotToken}`,
                    "User-Agent": "0Code-Monit Discord Monitor"
                },
                timeout: monitor.timeout * 1000,
            });

            const endTime = Date.now();
            heartbeat.ping = endTime - startTime;

            if (response.status === 200 && response.data.id) {
                heartbeat.status = UP;
                heartbeat.msg = `Bot "${response.data.username}#${response.data.discriminator}" is online`;
            } else {
                heartbeat.status = DOWN;
                heartbeat.msg = "Bot authentication failed";
            }

        } catch (error) {
            heartbeat.status = DOWN;
            
            if (error.response) {
                switch (error.response.status) {
                    case 401:
                        heartbeat.msg = "Invalid bot token";
                        break;
                    case 429:
                        heartbeat.msg = "Rate limited by Discord API";
                        break;
                    case 500:
                    case 502:
                    case 503:
                    case 504:
                        heartbeat.msg = "Discord API is down";
                        break;
                    default:
                        heartbeat.msg = `Discord API error: ${error.response.status}`;
                }
            } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
                heartbeat.msg = "Cannot connect to Discord API";
            } else if (error.code === "ECONNABORTED") {
                heartbeat.msg = "Request timeout";
            } else {
                heartbeat.msg = error.message || "Unknown error occurred";
            }
        }
    }
}

module.exports = {
    DiscordMonitorType,
};