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
     *
     */
    checkInstalled() {
        return commandExistsSync(this.cloudflaredPath);
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
        if (this.change) {
            this.change(this.running, msg, code);
        }
    }

    /**
     * @param msg
     */
    emitError(msg) {
        if (this.error) {
            this.error(msg);
        }
    }

    /**
     *
     */
    start() {
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
        // Keep logs visible in parent console
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
            if (err.code === "ENOENT") {
                this.emitError(`Cloudflared error: ${this.cloudflaredPath} is not found`);
            } else {
                this.emitError(err);
            }
        });

        if (this.childProcess.stderr) {
            this.childProcess.stderr.on("data", (data) => {
                this.emitError(data.toString());
            });
        }
    }

    /**
     *
     */
    stop() {
        this.emitChange("Stopping cloudflared");
        if (this.childProcess) {
            this.childProcess.kill("SIGINT");
            this.childProcess = null;
        }
    }
}

module.exports = { CloudflaredTunnel };
