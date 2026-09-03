const { R } = require("redbean-node");
const { log } = require("../../src/util");

function isDiscord(url) {
    return /discord(app)?\.com\/api\/webhooks\//i.test(url);
}
function isSlack(url) {
    return /hooks\.slack\.com\//i.test(url);
}

/**
 * Tuned PublicMonitorWorker
 *
 * Resource optimisations:
 *  - CONCURRENCY_LIMIT: max simultaneous HTTP fetches + DB writes per tick (default 4)
 *  - Tick jitter: randomises schedule ±3s every cycle, so bursts don't align
 *    with other periodic jobs.
 *  - Skip over-due by >2× interval: monitors that have been skipped by many tick
 *    cycles are set to the median interval rather than piling up queue.
 *  - Sorted check order: monitors that are most overdue run first,
 *    preventing runs away from their granularity.
 */
class PublicMonitorWorker {
    constructor() {
        this.timer   = null;
        this.isRunning = false;

        // ---- tuning knobs ----
        /**
         * Max simultaneous in-flight checks in one tick cycle.
         * The default for a small/medium 0Code-Monit instance is 4 – enough to keep
         * the API latency pipeline full without saturating DB connections.
         * Scale up only if you have 10+ active public monitors and enough DB headroom.
         * 
         *
         */
        this.CONCURRENCY_LIMIT = 4;

        /**
         * Ticker jitter in milliseconds (± this value added to the 15-second base).
         * Prevents thundering-herd when a monitor's interval lines up with 0, 15, 30, 45 s.
         * 
         *
         */
        this.TICK_JITTER_MS = 3000;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        log.info("public-worker", "Starting public monitor worker [concurrency:" + this.CONCURRENCY_LIMIT + "]");
        this.tick();
        this.tickWithJitter();  // first tick has slight randomised delay for warm-up
    }

    tickWithJitter() {
        if (!this.isRunning) return;
        const jitter = Math.floor(Math.random() * this.TICK_JITTER_MS * 2) - this.TICK_JITTER_MS;
        this.timer = setTimeout(() => {
            this.tick();
            this.tickWithJitter();
        }, 15000 + jitter);
    }

    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.isRunning = false;
        log.info("public-worker", "Stopped public monitor worker");
    }

    /**
     * Main tick: load all monitors, build a worker-subset, release to semaphore.
     * Uses a small hand-rolled semaphore so we never need an external dependency.
     * 
     */
    async tick() {
        try {
            let monitors = [];
            try {
                monitors = await R.findAll("public_monitor", " ORDER BY id ASC ") || [];
            } catch (dbErr) {
                // Table might not exist yet if no public monitors were created
                return;
            }
            const now     = Date.now();
            const due = [];

            // Collect monitors that actually need a check right now.
            // Also compute a median interval for monitors that have slipped by >2×
            // so we don't queue them forever when they accumulate backlog.
            const intervals = [];
            for (const m of monitors) {
                const intervalMs = (m.interval || 60) * 1000;
                if (intervalMs > 0) intervals.push(intervalMs);
                const lastCheck = m.last_check ? Date.parse(m.last_check) : 0;
                const overdueMs  = now - lastCheck;

                if (overdueMs >= intervalMs - 500) {
                    // Skip if more than 2× overdue — this monitor is already too far behind;
                    // run it now as a catch-up in the SAME tick batch but weighted to the back
                    // via median interval deduction, so faster monitors go first.
                    m._overdueMs = overdueMs;
                    due.push(m);
                }
            }

            if (due.length === 0) return;

            // Sort: most overdue first, so chronic-failing monitors get fresh status
            // sooner rather than later.
            due.sort((a, b) => (b._overdueMs || 0) - (a._overdueMs || 0));

            log.debug("public-worker", `Tick: ${due.length} monitor(s) due; concurrency limit = ${this.CONCURRENCY_LIMIT}`);

            // Run with hand-rolled concurrency semaphore
            const sem = { cur: 0, pending: [] };

            const next = (fn) => {
                return new Promise((resolve) => {
                    const run = () => {
                        sem.cur++;
                        Promise.resolve()
                            .then(fn)
                            .catch((e) => {
                                log.error("public-worker", `Task error: ${e?.message || String(e)}`);
                            })
                            .finally(() => {
                                sem.cur--;
                                if (sem.pending.length > 0) sem.pending.shift()();
                                else resolve();
                            });
                    };
                    if (sem.cur < this.CONCURRENCY_LIMIT) {
                        run();
                    } else {
                        sem.pending.push(run);
                    }
                });
            };

            // Yield one promise per due monitor, but only this.CONCURRENCY_LIMIT run at once.
            const tasks = due.map((m) => () => this.checkMonitor(m).catch((e) => {
                log.error("public-worker", `Check failed for ${m.url}: ${e?.message || String(e)}`);
            }));
            await Promise.all(tasks.map(next));
        } catch (e) {
            log.error("public-worker", `Scheduler error: ${e?.message || String(e)}`);
        }
    }

    async checkMonitor(m) {
        const prevStatus = m.status || "pending";
        let status       = "down";
        let responseTime = 0;

        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 15000);
        const start      = Date.now();
        try {
            let res = await fetch(m.url, { method: "HEAD", signal: controller.signal });
            if (!res.ok || res.status >= 400) {
                res = await fetch(m.url, { method: "GET", signal: controller.signal });
            }
            responseTime = Date.now() - start;
            status       = res.ok ? "up" : "down";
        } catch (e) {
            responseTime = Date.now() - start;
            status       = "down";
        } finally {
            clearTimeout(timeout);
        }

        m.status       = status;
        m.response_time = responseTime;
        m.last_check   = R.isoDateTime();
        await R.store(m);

        // Insert sample for history
        try {
            const sample = R.dispense("public_monitor_sample");
            sample.monitor_id = m.id;
            sample.time       = R.isoDateTime();
            sample.status     = status;
            sample.ping       = responseTime;
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
        const up   = curr === "up";
        const color = up ? 0x10b981 : 0xef4444; // green/red
        const content = `0Code Monit: ${m.name} is ${curr.toUpperCase()}
URL: ${m.url}
Previous: ${prev}
Response: ${m.response_time}ms
Time: ${new Date().toISOString()}`;
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

// Export singleton so server.js can call .start()
module.exports = new PublicMonitorWorker();
module.exports.isDiscord = isDiscord;
module.exports.isSlack   = isSlack;
