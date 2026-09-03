import axios from "axios";
import { getDevContainerServerHostname, isDevContainer } from "../util-frontend";

const env = process.env.NODE_ENV || "production";

// change the axios base url for development
if (env === "development" && isDevContainer()) {
    axios.defaults.baseURL = location.protocol + "//" + getDevContainerServerHostname();
} else if (env === "development" || localStorage.dev === "dev") {
    axios.defaults.baseURL = location.protocol + "//" + location.hostname + ":3001";
}

export default {
    data() {
        return {
            publicGroupList: [],
        };
    },
    computed: {
        publicMonitorList() {
            let result = {};

            for (let group of this.publicGroupList) {
                for (let monitor of group.monitorList) {
                    result[monitor.id] = monitor;
                }
            }
            return result;
        },

        publicLastHeartbeatList() {
            let result = {};

            for (let monitorID in this.publicMonitorList) {
                if (this.lastHeartbeatList[monitorID]) {
                    result[monitorID] = this.lastHeartbeatList[monitorID];
                }
            }

            return result;
        },

        baseURL() {
            const primaryBaseURL = this.$root.info.primaryBaseURL;

            // Skip primaryBaseURL if it points to localhost/loopback (e.g. inside a Docker container)
            // so that badge URLs remain publicly accessible when served behind a reverse proxy or tunnel.
            if (primaryBaseURL) {
                try {
                    const parsed = new URL(primaryBaseURL);
                    const isLocal = parsed.hostname === "localhost" ||
                        parsed.hostname === "127.0.0.1" ||
                        parsed.hostname === "[::1]" ||
                        parsed.hostname === "0.0.0.0";
                    if (!isLocal) {
                        return primaryBaseURL;
                    }
                } catch (_) {
                    // Invalid URL – fall through to default
                }
            }

            if (env === "development" || localStorage.dev === "dev") {
                return axios.defaults.baseURL;
            } else {
                return location.protocol + "//" + location.host;
            }
        },
    }
};
