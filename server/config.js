const isFreeBSD = /^freebsd/.test(process.platform);

// Interop with browser
const args = (typeof process !== "undefined") ? require("args-parser")(process.argv) : {};

// If host is omitted, the server will accept connections on the unspecified IPv6 address (::) when IPv6 is available and the unspecified IPv4 address (0.0.0.0) otherwise.
// Dual-stack support for (::)
// Also read HOST if not FreeBSD, as HOST is a system environment variable in FreeBSD
let hostEnv = isFreeBSD ? null : process.env.HOST;
const hostname = args.host || process.env.CODE_MONIT_HOST || process.env.UPTIME_KUMA_HOST || hostEnv;

// Use 3001 by default in development; in production, allow env/args to override
const isDevEnv = process.env.NODE_ENV === "development";
const defaultPort = isDevEnv ? 3001 : undefined;

// Debug port resolution
console.log("[CONFIG] Port resolution:", {
    args_port: args.port,
    CODE_MONIT_PORT: process.env.CODE_MONIT_PORT,
    UPTIME_KUMA_PORT: process.env.UPTIME_KUMA_PORT,
    PORT: isDevEnv ? "(ignored in dev)" : process.env.PORT,
    defaultPort,
    NODE_ENV: process.env.NODE_ENV
});

const portCandidates = isDevEnv
    ? [ args.port, process.env.CODE_MONIT_PORT, process.env.UPTIME_KUMA_PORT, defaultPort ]
    : [ args.port, process.env.CODE_MONIT_PORT, process.env.UPTIME_KUMA_PORT, process.env.PORT, defaultPort ];

const port = portCandidates
    .map(portValue => parseInt(portValue))
    .find(portValue => !isNaN(portValue)) || 3000;

const sslKey = args["ssl-key"] || process.env.CODE_MONIT_SSL_KEY || process.env.UPTIME_KUMA_SSL_KEY || process.env.SSL_KEY || undefined;
const sslCert = args["ssl-cert"] || process.env.CODE_MONIT_SSL_CERT || process.env.UPTIME_KUMA_SSL_CERT || process.env.SSL_CERT || undefined;
const sslKeyPassphrase = args["ssl-key-passphrase"] || process.env.CODE_MONIT_SSL_KEY_PASSPHRASE || process.env.UPTIME_KUMA_SSL_KEY_PASSPHRASE || process.env.SSL_KEY_PASSPHRASE || undefined;

const isSSL = sslKey && sslCert;

/**
 * Get the local WebSocket URL
 * @returns {string} The local WebSocket URL
 */
function getLocalWebSocketURL() {
    const protocol = isSSL ? "wss" : "ws";
    const host = hostname || "localhost";
    return `${protocol}://${host}:${port}`;
}

const localWebSocketURL = getLocalWebSocketURL();

const demoMode = args["demo"] || false;

module.exports = {
    args,
    hostname,
    port,
    sslKey,
    sslCert,
    sslKeyPassphrase,
    isSSL,
    localWebSocketURL,
    demoMode,
};
