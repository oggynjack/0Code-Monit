const { checkLogin, setSetting, setting, doubleCheckPassword } = require("../util-server");
const { CloudflaredTunnel } = require("../cloudflared-wrapper");
const { UptimeKumaServer } = require("../uptime-kuma-server");
const { log } = require("../../src/util");
const io = UptimeKumaServer.getInstance().io;

const prefix = "cloudflared_";
const cloudflared = new CloudflaredTunnel();

/**
 * Change running state
 * @param {string} running Is it running?
 * @param {string} message Message to pass
 * @returns {void}
 */
cloudflared.change = (running, message) => {
    io.to("cloudflared").emit(prefix + "running", running);
    io.to("cloudflared").emit(prefix + "message", message);
};

/**
 * Emit an error message
 * @param {string} errorMessage Error message to send
 * @returns {void}
 */
cloudflared.error = (errorMessage) => {
    io.to("cloudflared").emit(prefix + "errorMessage", errorMessage);
};

/**
 * Handler for cloudflared
 * @param {Socket} socket Socket.io instance
 * @returns {void}
 */
module.exports.cloudflaredSocketHandler = (socket) => {

    socket.on(prefix + "join", async () => {
        try {
            checkLogin(socket);
            socket.join("cloudflared");
            io.to(socket.userID).emit(prefix + "installed", cloudflared.checkInstalled());
            io.to(socket.userID).emit(prefix + "running", cloudflared.running);
            io.to(socket.userID).emit(prefix + "token", await setting("cloudflaredTunnelToken"));
            io.to(socket.userID).emit(prefix + "disabled", !!(await setting("cloudflaredDisabled")));
        } catch (error) { }
    });

    socket.on(prefix + "leave", async () => {
        try {
            checkLogin(socket);
            socket.leave("cloudflared");
        } catch (error) { }
    });

    socket.on(prefix + "start", async (token) => {
        try {
            checkLogin(socket);
            // Even if disabled persist flag is on, allow explicit manual start only if user toggled it off
            const disabled = !!(await setting("cloudflaredDisabled"));
            if (disabled) {
                cloudflared.error("Cloudflare Tunnel is disabled. Enable it first.");
                return;
            }
            if (token && typeof token === "string") {
                await setSetting("cloudflaredTunnelToken", token);
                cloudflared.token = token;
            } else {
                cloudflared.token = null;
            }
            cloudflared.start();
        } catch (error) { }
    });

    socket.on(prefix + "stop", async (currentPassword, callback) => {
        try {
            checkLogin(socket);
            const disabledAuth = await setting("disableAuth");
            if (!disabledAuth) {
                await doubleCheckPassword(socket, currentPassword);
            }
            cloudflared.stop();
        } catch (error) {
            callback({
                ok: false,
                msg: error.message,
            });
        }
    });

    socket.on(prefix + "removeToken", async () => {
        try {
            checkLogin(socket);
            await setSetting("cloudflaredTunnelToken", "");
        } catch (error) { }
    });

    // Persistently enable/disable cloudflared auto start
    socket.on(prefix + "setDisabled", async (disabled, callback) => {
        try {
            checkLogin(socket);
            const value = !!disabled;
            await setSetting("cloudflaredDisabled", value);
            io.to(socket.userID).emit(prefix + "disabled", value);
            if (value) {
                // Stop if currently running
                cloudflared.stop();
            }
            if (typeof callback === "function") {
                callback({
                    ok: true
                });
            }
        } catch (error) {
            if (typeof callback === "function") {
                callback({
                    ok: false,
                    msg: error.message
                });
            }
        }
    });

};

/**
 * Automatically start cloudflared
 * @param {string} token Cloudflared tunnel token
 * @returns {Promise<void>}
 */
module.exports.autoStart = async (token) => {
    if (!token) {
        token = await setting("cloudflaredTunnelToken");
    } else {
        // Override the current token via args or env var
        await setSetting("cloudflaredTunnelToken", token);
        console.log("Use cloudflared token from args or env var");
    }

    const disabled = !!(await setting("cloudflaredDisabled"));
    if (disabled) {
        console.log("Cloudflared disabled by setting; not starting.");
        return;
    }

    if (token) {
        console.log("Start cloudflared");
        cloudflared.token = token;
        cloudflared.start();
    }
};

/**
 * Stop cloudflared
 * @returns {Promise<void>}
 */
module.exports.stop = async () => {
    log.info("cloudflared", "Stop cloudflared");
    if (cloudflared) {
        cloudflared.stop();
    }
};
