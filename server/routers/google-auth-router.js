const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { R } = require("redbean-node");
const { log } = require("../../src/util");

function getCredentials() {
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    return { clientId, clientSecret };
}

function getRedirectUri(req) {
    if (process.env.GOOGLE_REDIRECT_URI) {
        return process.env.GOOGLE_REDIRECT_URI;
    }
    if (req) {
        const proto = req.headers["x-forwarded-proto"] || req.protocol || (process.env.NODE_ENV === "production" ? "https" : "http");
        const host = req.headers["x-forwarded-host"] || req.get("host");
        if (host) {
            return `${proto}://${host}/auth/google/callback`;
        }
    }
    return process.env.NODE_ENV === "production"
        ? "https://monit.0code.uk/auth/google/callback"
        : "http://localhost:3000/auth/google/callback";
}

function getOAuthClient(req) {
    const { clientId, clientSecret } = getCredentials();
    const redirectUri = getRedirectUri(req);

    if (!clientId || !clientSecret) {
        return null;
    }
    return new OAuth2Client(clientId, clientSecret, redirectUri);
}

// Initiate Google OAuth flow
router.get("/auth/google", (req, res) => {
    const oauth2Client = getOAuthClient(req);
    if (!oauth2Client) {
        log.warn("google-auth", "Google OAuth not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
        return res.redirect("/public-login?error=oauth_not_configured");
    }

    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ],
        prompt: "consent"
    });

    log.info("google-auth", `Initiating Google OAuth with redirect_uri: ${getRedirectUri(req)}`);
    res.redirect(authorizeUrl);
});

// Google OAuth callback
router.get("/auth/google/callback", async (req, res) => {
    try {
        const { clientId } = getCredentials();
        const oauth2Client = getOAuthClient(req);
        if (!oauth2Client) {
            throw new Error("Google OAuth credentials are not configured");
        }

        const { code } = req.query;
        if (!code) {
            throw new Error("No authorization code received");
        }

        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Get user info
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: clientId
        });

        const payload = ticket.getPayload();
        const email = payload.email;
        const name = payload.name;
        const googleId = payload.sub;

        log.info("google-auth", `Login attempt for: ${email}`);

        // Check if user exists
        let user = await R.findOne("user", " email = ? ", [ email ]);

        let isNewUser = false;
        if (!user) {
            // Create new public user without password (needs setup)
            user = R.dispense("user");
            user.username = email.split("@")[0] + "_" + Date.now();
            user.email = email;
            user.google_id = googleId;
            user.active = true;
            user.password = null; // No password yet - needs setup
            await R.store(user);
            isNewUser = true;

            log.info("google-auth", `New public user created: ${email}`);
        } else if (!user.google_id) {
            // Link Google account to existing user
            user.google_id = googleId;
            await R.store(user);
            log.info("google-auth", `Google account linked for: ${email}`);
        }

        // Generate JWT token for session
        const jwtSecret = await require("../util-server").setting("jwtSecret");
        const token = jwt.sign({
            userId: user.id,
            username: user.username,
            email: user.email,
            needsSetup: isNewUser || !user.password
        }, jwtSecret, { expiresIn: "30d" });

        // Redirect new users to account setup, existing users to dashboard
        if (isNewUser || !user.password) {
            res.redirect(`/public-account-setup?token=${token}`);
        } else {
            res.redirect(`/public-dashboard?token=${token}`);
        }

    } catch (error) {
        log.error("google-auth", `OAuth callback error: ${error.message}`);
        res.redirect(`/public-login?error=${encodeURIComponent(error.message || "auth_failed")}`);
    }
});

// Logout route
router.get("/auth/logout", (req, res) => {
    res.redirect("/public-login");
});

module.exports = router;
