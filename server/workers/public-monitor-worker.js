const { R } = require("redbean-node");
const { log } = require("../../src/util");

function isDiscord(url) {
    return /discord(app)?\.com\/api\/webhooks\//i.test(url);
}
function isSlack(url) {
    return /hooks\.slack\.com\//i.test(url);
}

class PublicMonitorWorker {
    constructor() {
        this.timer = null;
        this.isRunning = false;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        log.info("public-worker", "Starting public monitor worker");
        // Run immediately, then every 15s to schedule checks by interval
        this.tick();
        this.timer = setInterval(() => this.tick(), 15000);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
        log.info("public-worker", "Stopped public monitor worker");
    }

    async tick() {
        try {
            // Fetch all public monitors
            const monitors = await R.findAll("public_monitor", " ORDER BY id ASC ");
            const now = Date.now();

            for (const m of monitors) {
                const intervalMs = (m.interval || 60) * 1000;
                const lastCheck = m.last_check ? Date.parse(m.last_check) : 0;

                // Schedule by interval
                if (now - lastCheck >= intervalMs - 500) {
                    // Fire and forget to avoid blocking
                    this.checkMonitor(m).catch((e) => {
                        log.error("public-worker", `Check failed for ${m.url}: ${e.message}`);
                    });
                }
            }
        } catch (e) {
            log.error("public-worker", `Scheduler error: ${e.message}`);
        }
    }

    async checkMonitor(m) {
        const prevStatus = m.status || "pending";
        let status = "down";
        let responseTime = 0;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        const start = Date.now();
        try {
            // Prefer HEAD, fallback to GET if server rejects HEAD
            let res = await fetch(m.url, { method: "HEAD", signal: controller.signal });
            if (!res.ok || res.status >= 400) {
                res = await fetch(m.url, { method: "GET", signal: controller.signal });
            }
            responseTime = Date.now() - start;
            status = res.ok ? "up" : "down";
        } catch (e) {
            responseTime = Date.now() - start;
            status = "down";
        } finally {
            clearTimeout(timeout);
        }

        m.status = status;
        m.response_time = responseTime;
        m.last_check = R.isoDateTime();
        await R.store(m);

        // Insert sample for history
        try {
            const sample = R.dispense("public_monitor_sample");
            sample.monitor_id = m.id;
            sample.time = R.isoDateTime();
            sample.status = status;
            sample.ping = responseTime;
            await R.store(sample);
        } catch (e) {
            log.error("public-worker", "Sample store failed: " + e.message);
        }

        if (m.webhook && prevStatus !== status) {
            this.sendWebhook(m, prevStatus, status).catch((e) => {
                log.error("public-worker", `Webhook failed for ${m.url}: ${e.message}`);
            });
        }
    }

    async sendWebhook(m, prev, curr) {
        const up = curr === "up";
        const color = up ? 0x10b981 : 0xef4444; // green/red
        const content = `0Code Monit: ${m.name} is ${curr.toUpperCase()}\nURL: ${m.url}\nPrevious: ${prev}\nResponse: ${m.response_time}ms\nTime: ${new Date().toISOString()}`;
        await this.sendWebhookToURL(m.webhook, content, color);
    }

    async sendWebhookToURL(url, content, color = 0x6366f1) {
        try {
            let payload;
            if (isDiscord(url)) {
                payload = {
                    content,
                    embeds: [
                        {
                            title: "0Code Monit Notification",
                            description: content,
                            color
                        }
                    ]
                };
            } else if (isSlack(url)) {
                payload = { text: content };
            } else {
                payload = { message: content };
            }
            await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            log.error("public-worker", `Webhook post failed: ${e.message}`);
        }
    }
}

module.exports = new PublicMonitorWorker();
module.exports.isDiscord = isDiscord;
module.exports.isSlack = isSlack;
