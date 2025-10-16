module.exports = {
    apps: [
        {
            name: "0Code-Monit",
            script: "server/server.js",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            max_memory_restart: "500M",
            env: {
                NODE_ENV: "production",
                ZEROCODE_MONIT_PORT: 4010,
                ZEROCODE_MONIT_HOST: "0.0.0.0"
            },
            error_file: "logs/0code-monit-error.log",
            out_file: "logs/0code-monit-out.log",
            log_date_format: "YYYY-MM-DD HH:mm:ss Z",
            merge_logs: false,
            autorestart: true,
            max_restarts: 10,
            min_uptime: "10s"
        }
    ]
};
