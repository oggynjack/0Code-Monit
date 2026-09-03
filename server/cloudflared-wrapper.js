const childProcess = require("child_process");
const commandExistsSync = require("command-exists").sync;

class CloudflaredTunnel {
    /**
     * @param cloudflaredPath
     */
    constructor(cloudflaredPath = "cloudflared") {
        this.cloudflaredPath = cloudflaredPath;
        this.url = "http://localhost:80";
        this.hostname = "";
    }

    /**
     *
     */
    get token() {
        return this._token;
    }

    /**
     *
     */
    set token(token) {
        if (token && typeof token === "string") {
            token = token.trim();
            // try to strip out "cloudflared.exe service install"
            const array = token.split(" ");
            if (array.length > 1) {
                for (let i = 0; i < array.length - 1; i++) {
                    if (array[i] === "install") {
                        token = array[i + 1];
                    }
                }
            }
        }
        this._token = token;
    }

    /**
     * Check if cloudflared binary is installed
     */
    checkInstalled() {
        try {
            return commandExistsSync(this.cloudflaredPath);
        } catch (_) {
            return false;
        }
    }

    /**
     *
     */
    change() {}
    /**
     *
     */
    error() {}

    /**
     * @param msg
     * @param code
     */
    emitChange(msg, code) {
        try {
            if (this.change) {
                this.change(this.running, msg, code);
            }
        } catch (_) {}
    }

    /**
     * @param msg
     */
    emitError(msg) {
        try {
            if (this.error) {
                this.error(msg);
            }
        } catch (_) {}
    }

    /**
     *
     */
    start() {
        try {
            if (this.childProcess) {
                this.emitError("Already started");
                return;
            }
            if (!this.checkInstalled()) {
                this.emitError(`Cloudflared error: ${this.cloudflaredPath} is not found`);
                return;
            }
            if (!this.token) {
                this.emitError("Cloudflared error: Token is not set");
                return;
            }

            const args = [ "tunnel", "--no-autoupdate", "run", "--token", this.token ];

            this.running = true;
            this.emitChange("Starting cloudflared");
            // Hide the console window on Windows
            this.childProcess = childProcess.spawn(this.cloudflaredPath, args, { windowsHide: true });
            
            if (this.childProcess.stdout) {
                this.childProcess.stdout.pipe(process.stdout);
            }
            if (this.childProcess.stderr) {
                this.childProcess.stderr.pipe(process.stderr);
            }

            this.childProcess.on("close", (code) => {
                this.running = false;
                this.childProcess = null;
                this.emitChange("Stopped cloudflared", code);
            });

            this.childProcess.on("error", (err) => {
                this.running = false;
                this.childProcess = null;
                if (err.code === "ENOENT") {
                    this.emitError(`Cloudflared error: ${this.cloudflaredPath} is not found`);
                } else {
                    this.emitError(err.message || String(err));
                }
            });

            if (this.childProcess.stderr) {
                this.childProcess.stderr.on("data", (data) => {
                    this.emitError(data.toString());
                });
            }
        } catch (e) {
            this.running = false;
            this.childProcess = null;
            this.emitError(`Cloudflared spawn failed: ${e.message}`);
        }
    }

    /**
     *
     */
    stop() {
        try {
            this.emitChange("Stopping cloudflared");
            if (this.childProcess) {
                this.childProcess.kill("SIGINT");
                this.childProcess = null;
            }
        } catch (_) {
            this.childProcess = null;
        }
        this.running = false;
    }
}

module.exports = { CloudflaredTunnel };
