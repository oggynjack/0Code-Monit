const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { R } = require("redbean-node");
const { log } = require("../../src/util");
const { setting } = require("../util-server");
const passwordHash = require("../password-hash");
const nodemailer = require("nodemailer");

// Middleware to verify JWT token
async function verifyPublicToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.substring(7);
        const jwtSecret = await setting("jwtSecret");
        
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        log.error("public-api", `Token verification failed: ${error.message}`);
        return res.status(401).json({ error: "Invalid token" });
    }
}

// Send OTP for password reset
router.post("/api/public/send-reset-otp", verifyPublicToken, async (req, res) => {
    try {
        const user = await R.load("user", req.userId);
        
        if (!user || !user.id) {
            return res.status(404).json({ error: "User not found" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store OTP in database with expiry (10 minutes)
        user.reset_otp = otp;
        user.reset_otp_expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        await R.store(user);

        // Send email with OTP
        try {
            const smtpConfig = await setting("smtpConfig");
            if (smtpConfig && smtpConfig.host) {
                const transporter = nodemailer.createTransport({
                    host: smtpConfig.host,
                    port: smtpConfig.port || 587,
                    secure: smtpConfig.secure || false,
                    auth: {
                        user: smtpConfig.username,
                        pass: smtpConfig.password
                    }
                });

                await transporter.sendMail({
                    from: smtpConfig.from || '"0Code Monit" <noreply@monit.0code.uk>',
                    to: user.email,
                    subject: "Password Reset Verification Code - 0Code Monit",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #0d6efd;">Password Reset Request</h2>
                            <p>You requested to reset your password for your 0Code Monit account.</p>
                            <p>Your verification code is:</p>
                            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                                ${otp}
                            </div>
                            <p>This code will expire in 10 minutes.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                            <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;" />
                            <p style="color: #6c757d; font-size: 12px;">0Code Monit - Website Monitoring Service</p>
                        </div>
                    `
                });
            }
        } catch (emailError) {
            log.error("public-api", `Failed to send OTP email: ${emailError.message}`);
            // Continue anyway - OTP is stored in database
        }

        log.info("public-api", `OTP sent for password reset: ${user.email}`);
        res.json({ success: true });
    } catch (error) {
        log.error("public-api", `Send OTP error: ${error.message}`);
        res.status(500).json({ error: "Failed to send verification code" });
    }
});

// Reset password with OTP
router.post("/api/public/reset-password", verifyPublicToken, async (req, res) => {
    try {
        const { otp, newPassword } = req.body;

        if (!otp || !newPassword) {
            return res.status(400).json({ error: "OTP and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const user = await R.load("user", req.userId);
        
        if (!user || !user.id) {
            return res.status(404).json({ error: "User not found" });
        }

        // Verify OTP
        if (!user.reset_otp || user.reset_otp !== otp) {
            return res.status(400).json({ error: "Invalid verification code" });
        }

        // Check expiry
        const expiry = new Date(user.reset_otp_expiry);
        if (Date.now() > expiry.getTime()) {
            return res.status(400).json({ error: "Verification code has expired" });
        }

        // Update password
        user.password = passwordHash.generate(newPassword);
        user.reset_otp = null;
        user.reset_otp_expiry = null;
        await R.store(user);

        log.info("public-api", `Password reset successfully for user ${user.email}`);
        res.json({ success: true });
    } catch (error) {
        log.error("public-api", `Reset password error: ${error.message}`);
        res.status(500).json({ error: "Failed to reset password" });
    }
});

// Complete account setup for new Google OAuth users
router.post("/api/public/complete-setup", verifyPublicToken, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
        }

        if (username.length < 3) {
            return res.status(400).json({ error: "Username must be at least 3 characters" });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters" });
        }

        const user = await R.load("user", req.userId);
        
        if (!user || !user.id) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if username is already taken by another user
        const existingUser = await R.findOne("user", " username = ? AND id != ? ", [username, req.userId]);
        if (existingUser) {
            return res.status(400).json({ error: "Username is already taken" });
        }

        // Update user with password and username
        user.username = username;
        user.password = passwordHash.generate(password);
        await R.store(user);

        log.info("public-api", `Account setup completed for user ${user.email}`);

        // Generate new token without needsSetup flag
        const jwtSecret = await setting("jwtSecret");
        const token = jwt.sign({
            userId: user.id,
            username: user.username,
            email: user.email
        }, jwtSecret, { expiresIn: "30d" });

        res.json({ success: true, token });
    } catch (error) {
        log.error("public-api", `Complete setup error: ${error.message}`);
        res.status(500).json({ error: "Failed to complete setup" });
    }
});

// Get all monitors for the authenticated user
router.get("/api/public/monitors", verifyPublicToken, async (req, res) => {
    try {
        const monitors = await R.findAll("public_monitor", " AND user_id = ? ORDER BY id DESC", [req.userId]);
        
        res.json(monitors.map(m => ({
            id: m.id,
            name: m.name,
            url: m.url,
            interval: m.interval,
            status: m.status || "pending",
            responseTime: m.response_time || 0,
            webhook: m.webhook || null,
            createdAt: m.created_at
        })));
    } catch (error) {
        log.error("public-api", `Error fetching monitors: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch monitors" });
    }
});

// Create a new monitor
router.post("/api/public/monitors", verifyPublicToken, async (req, res) => {
    try {
        // Check limit - free tier allows max 3 monitors
        const existingMonitors = await R.findAll("public_monitor", " AND user_id = ? ", [req.userId]);
        if (existingMonitors.length >= 3) {
            return res.status(400).json({ error: "Free tier limit reached (max 3 monitors)" });
        }

        const { name, url, interval } = req.body;

        if (!name || !url) {
            return res.status(400).json({ error: "Name and URL are required" });
        }

        const monitor = R.dispense("public_monitor");
        monitor.user_id = req.userId;
        monitor.name = name;
        monitor.url = url;
        monitor.interval = interval || 60;
        monitor.status = "pending";
        monitor.response_time = 0;
        monitor.webhook = null;
        monitor.created_at = R.isoDateTime();

        const id = await R.store(monitor);

        log.info("public-api", `Monitor created: ${name} by user ${req.userId}`);

        res.json({
            id,
            name: monitor.name,
            url: monitor.url,
            interval: monitor.interval,
            status: monitor.status,
            responseTime: monitor.response_time,
            webhook: monitor.webhook,
            createdAt: monitor.created_at
        });
    } catch (error) {
        log.error("public-api", `Error creating monitor: ${error.message}`);
        res.status(500).json({ error: "Failed to create monitor" });
    }
});

// Update a monitor
router.put("/api/public/monitors/:id", verifyPublicToken, async (req, res) => {
    try {
        const monitorId = parseInt(req.params.id);
        const monitor = await R.load("public_monitor", monitorId);

        if (!monitor || !monitor.id) {
            return res.status(404).json({ error: "Monitor not found" });
        }

        if (monitor.user_id !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { name, url, interval, webhook } = req.body;

        if (name !== undefined) monitor.name = name;
        if (url !== undefined) monitor.url = url;
        if (interval !== undefined) monitor.interval = interval;
        if (webhook !== undefined) monitor.webhook = webhook;

        await R.store(monitor);

        log.info("public-api", `Monitor updated: ${monitor.name} by user ${req.userId}`);

        res.json({
            id: monitor.id,
            name: monitor.name,
            url: monitor.url,
            interval: monitor.interval,
            status: monitor.status,
            responseTime: monitor.response_time,
            webhook: monitor.webhook,
            createdAt: monitor.created_at
        });
    } catch (error) {
        log.error("public-api", `Error updating monitor: ${error.message}`);
        res.status(500).json({ error: "Failed to update monitor" });
    }
});

// Delete a monitor
router.delete("/api/public/monitors/:id", verifyPublicToken, async (req, res) => {
    try {
        const monitorId = parseInt(req.params.id);
        const monitor = await R.load("public_monitor", monitorId);

        if (!monitor || !monitor.id) {
            return res.status(404).json({ error: "Monitor not found" });
        }

        if (monitor.user_id !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await R.trash(monitor);

        log.info("public-api", `Monitor deleted: ${monitor.name} by user ${req.userId}`);

        res.json({ success: true });
    } catch (error) {
        log.error("public-api", `Error deleting monitor: ${error.message}`);
        res.status(500).json({ error: "Failed to delete monitor" });
    }
});

// Get all status pages for the authenticated user
router.get("/api/public/status-pages", verifyPublicToken, async (req, res) => {
    try {
        const statusPages = await R.findAll("public_status_page", " AND user_id = ? ORDER BY id DESC", [req.userId]);
        
        res.json(statusPages.map(sp => ({
            id: sp.id,
            slug: sp.slug,
            url: `${req.protocol}://${req.get("host")}/public-status/${sp.slug}`,
            createdAt: sp.created_at
        })));
    } catch (error) {
        log.error("public-api", `Error fetching status pages: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch status pages" });
    }
});

// Create a new status page
router.post("/api/public/status-pages", verifyPublicToken, async (req, res) => {
    try {
        // Check limit - free tier allows max 2 status pages
        const existingPages = await R.findAll("public_status_page", " AND user_id = ? ", [req.userId]);
        if (existingPages.length >= 2) {
            return res.status(400).json({ error: "Free tier limit reached (max 2 status pages)" });
        }

        // Generate random slug
        const slug = Math.random().toString(36).substring(2, 10);

        const statusPage = R.dispense("public_status_page");
        statusPage.user_id = req.userId;
        statusPage.slug = slug;
        statusPage.created_at = R.isoDateTime();

        const id = await R.store(statusPage);

        log.info("public-api", `Status page created: ${slug} by user ${req.userId}`);

        res.json({
            id,
            slug,
            url: `${req.protocol}://${req.get("host")}/public-status/${slug}`,
            createdAt: statusPage.created_at
        });
    } catch (error) {
        log.error("public-api", `Error creating status page: ${error.message}`);
        res.status(500).json({ error: "Failed to create status page" });
    }
});

// Delete a status page
router.delete("/api/public/status-pages/:id", verifyPublicToken, async (req, res) => {
    try {
        const pageId = parseInt(req.params.id);
        const statusPage = await R.load("public_status_page", pageId);

        if (!statusPage || !statusPage.id) {
            return res.status(404).json({ error: "Status page not found" });
        }

        if (statusPage.user_id !== req.userId) {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await R.trash(statusPage);

        log.info("public-api", `Status page deleted: ${statusPage.slug} by user ${req.userId}`);

        res.json({ success: true });
    } catch (error) {
        log.error("public-api", `Error deleting status page: ${error.message}`);
        res.status(500).json({ error: "Failed to delete status page" });
    }
});

// Get status page by slug (public endpoint)
router.get("/api/public-status/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        
        const statusPage = await R.findOne("public_status_page", " slug = ? ", [slug]);
        
        if (!statusPage) {
            return res.status(404).json({ error: "Status page not found" });
        }

        // Get monitors attached to this status page
        const rows = await R.getAll(`
            SELECT pm.id, pm.name, pm.url, pm.status, pm.response_time
            FROM public_monitor pm
            INNER JOIN public_status_page_monitor spm ON spm.monitor_id = pm.id
            WHERE spm.status_page_id = ?
            ORDER BY pm.id DESC
        `, [ statusPage.id ]);

        res.json({
            slug: statusPage.slug,
            monitors: rows.map(m => ({
                id: m.id,
                name: m.name,
                url: m.url,
                status: m.status || "pending",
                responseTime: m.response_time || 0
            }))
        });
    } catch (error) {
        log.error("public-api", `Error fetching status page: ${error.message}`);
        res.status(500).json({ error: "Failed to fetch status page" });
    }
});

// Test webhook using URL provided by client (secured by token)
router.post("/api/public/test-webhook", verifyPublicToken, async (req, res) => {
    try {
        const { url } = req.body || {};
        if (!url) { return res.status(400).json({ error: "url is required" }); }
        const worker = require("../workers/public-monitor-worker");
        const sample = `0Code Monit TEST Webhook\nUser: ${req.userEmail}\nMessage: This is a long test webhook to verify delivery and formatting.\nTimestamp: ${new Date().toISOString()}`;
        await worker.sendWebhookToURL(url, sample, 0x3b82f6);
        res.json({ ok: true });
    } catch (e) {
        log.error("public-api", `Test webhook error: ${e.message}`);
        res.status(500).json({ error: "Failed to send test webhook" });
    }
});

// Test webhook for a specific monitor
router.post("/api/public/monitors/:id/test-webhook", verifyPublicToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const monitor = await R.load("public_monitor", id);
        if (!monitor || !monitor.id) return res.status(404).json({ error: "Monitor not found" });
        if (monitor.user_id !== req.userId) return res.status(403).json({ error: "Unauthorized" });
        if (!monitor.webhook) return res.status(400).json({ error: "No webhook configured" });
        const worker = require("../workers/public-monitor-worker");
        const msg = `0Code Monit TEST: ${monitor.name}\nURL: ${monitor.url}\nThis is a test message.\nTime: ${new Date().toISOString()}`;
        await worker.sendWebhookToURL(monitor.webhook, msg, 0x6366f1);
        res.json({ ok: true });
    } catch (e) {
        log.error("public-api", `Monitor test webhook error: ${e.message}`);
        res.status(500).json({ error: "Failed to send test webhook" });
    }
});

// Get monitors attached to a status page
router.get("/api/public/status-pages/:id/monitors", verifyPublicToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const page = await R.load("public_status_page", id);
        if (!page || !page.id) return res.status(404).json({ error: "Status page not found" });
        if (page.user_id !== req.userId) return res.status(403).json({ error: "Unauthorized" });

        const attached = await R.getAll(`SELECT monitor_id FROM public_status_page_monitor WHERE status_page_id = ?`, [id]);
        res.json({ monitorIds: attached.map(r => r.monitor_id) });
    } catch (e) {
        log.error("public-api", `Get page monitors error: ${e.message}`);
        res.status(500).json({ error: "Failed to load status page monitors" });
    }
});

// Replace monitors attached to a status page
router.post("/api/public/status-pages/:id/monitors", verifyPublicToken, async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const page = await R.load("public_status_page", id);
        if (!page || !page.id) return res.status(404).json({ error: "Status page not found" });
        if (page.user_id !== req.userId) return res.status(403).json({ error: "Unauthorized" });

        const monitorIds = Array.isArray(req.body?.monitorIds) ? req.body.monitorIds.map(x => parseInt(x)) : [];

        // Filter to user's monitors only
        const validRows = monitorIds.length ? await R.getAll(
            `SELECT id FROM public_monitor WHERE user_id = ? AND id IN (${monitorIds.map(() => '?').join(',')})`,
            [ req.userId, ...monitorIds ]
        ) : [];
        const validIds = validRows.map(r => r.id);

        // Clear existing
        await R.exec(`DELETE FROM public_status_page_monitor WHERE status_page_id = ?`, [ id ]);
        // Insert new
        for (const mid of validIds) {
            const row = R.dispense("public_status_page_monitor");
            row.status_page_id = id;
            row.monitor_id = mid;
            await R.store(row);
        }
        res.json({ ok: true, monitorIds: validIds });
    } catch (e) {
        log.error("public-api", `Set page monitors error: ${e.message}`);
        res.status(500).json({ error: "Failed to set status page monitors" });
    }
});

// Segments for last X hours for attached monitors
router.get("/api/public-status/:slug/segments", async (req, res) => {
    try {
        const slug = req.params.slug;
        const hours = parseInt(req.query.hours || '24');
        const bucket = parseInt(req.query.bucket || '15'); // minutes
        const statusPage = await R.findOne("public_status_page", " slug = ? ", [ slug ]);
        if (!statusPage) return res.status(404).json({ error: "Status page not found" });

        const monitorRows = await R.getAll(`
            SELECT pm.id, pm.last_check, pm.interval
            FROM public_monitor pm
            INNER JOIN public_status_page_monitor spm ON spm.monitor_id = pm.id
            WHERE spm.status_page_id = ?
        `, [ statusPage.id ]);
        const monitorIds = monitorRows.map(r => r.id);
        if (monitorIds.length === 0) {
            const now = new Date();
            return res.json({ segments: {}, bucket, serverTime: now.toISOString(), nextRefreshAt: new Date(now.getTime() + 300000).toISOString() });
        }

        // Fetch samples in range
        const now = Date.now();
        const sinceISO = new Date(now - hours * 3600 * 1000).toISOString().slice(0,19).replace('T',' ');
        const samples = await R.getAll(`
            SELECT monitor_id, status, time FROM public_monitor_sample
            WHERE monitor_id IN (${monitorIds.map(() => '?').join(',')}) AND time >= ?
            ORDER BY time ASC
        `, [ ...monitorIds, sinceISO ]);

        const buckets = Math.ceil((hours * 60) / bucket);
        const result = {};
        for (const mid of monitorIds) {
            result[mid] = new Array(buckets).fill('unknown');
        }
        for (const row of samples) {
            const t = new Date(row.time).getTime();
            const idxFromEnd = Math.floor((now - t) / (bucket * 60000));
            const idx = buckets - 1 - idxFromEnd;
            if (idx >= 0 && idx < buckets) {
                // prefer down over up, up over unknown
                const cur = result[row.monitor_id][idx];
                const ns = row.status === 'down' ? 'down' : (row.status === 'up' ? 'up' : 'unknown');
                if (cur === 'unknown' || (cur === 'up' && ns === 'down')) {
                    result[row.monitor_id][idx] = ns;
                }
            }
        }

        // Compute next refresh as a fixed 5-minute boundary like main status page
        const serverTimeISO = new Date(now).toISOString();
        const nextAt = Math.ceil(now / 300000) * 300000;
        const nextISO = new Date(nextAt).toISOString();
        res.json({ segments: result, bucket, serverTime: serverTimeISO, nextRefreshAt: nextISO });
    } catch (e) {
        log.error("public-api", `Segments error: ${e.message}`);
        res.status(500).json({ error: "Failed to load segments" });
    }
});

// Events within a time window for a monitor on a public status page
router.get("/api/public-status/:slug/events", async (req, res) => {
    try {
        const { slug } = req.params;
        const monitorId = parseInt(req.query.monitorId);
        const from = req.query.from; // ISO
        const to = req.query.to;     // ISO
        if (!monitorId || !from || !to) return res.status(400).json({ error: "monitorId, from, to required" });

        const statusPage = await R.findOne("public_status_page", " slug = ? ", [ slug ]);
        if (!statusPage) return res.status(404).json({ error: "Status page not found" });

        // Ensure monitor is attached to this page
        const row = await R.getRow(`SELECT 1 FROM public_status_page_monitor WHERE status_page_id = ? AND monitor_id = ? LIMIT 1`, [ statusPage.id, monitorId ]);
        if (!row) return res.status(403).json({ error: "Monitor not attached" });

        const events = await R.getAll(`
            SELECT status, time, ping
            FROM public_monitor_sample
            WHERE monitor_id = ? AND time >= ? AND time <= ?
            ORDER BY time ASC
            LIMIT 200
        `, [ monitorId, from, to ]);
        res.json({ events });
    } catch (e) {
        log.error("public-api", `Events error: ${e.message}`);
        res.status(500).json({ error: "Failed to load events" });
    }
});

module.exports = router;
