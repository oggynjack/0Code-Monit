const express = require("express");
const { R } = require("redbean-node");
const { UptimeKumaServer } = require("../uptime-kuma-server");
const passwordHash = require("../password-hash");
const { allowDevAllOrigin } = require("../util-server");
const crypto = require("crypto");
const APIKey = require("../model/api_key");

const router = express.Router();
const server = UptimeKumaServer.getInstance();

// Per-user online visitor last-seen map: Map<userID, Map<sid, lastSeenEpochMs>>
const onlineByUser = new Map();

/**
 * @param map
 * @param now
 * @param ttlMs
 */
function pruneAndCountOnline(map, now, ttlMs = 60000) {
    for (const [ sid, ts ] of map.entries()) {
        if (now - ts > ttlMs) {
            map.delete(sid);
        }
    }
    return map.size;
}

/**
 * @param k
 */
function parseFormattedKey(k) {
    // Expect format: uk<id>_<clear>
    if (typeof k !== "string" || !k.startsWith("uk")) {
        throw new Error("Invalid key format");
    }
    const underscore = k.indexOf("_");
    if (underscore === -1) {
        throw new Error("Invalid key format");
    }
    const idStr = k.substring(2, underscore);
    const clear = k.substring(underscore + 1);
    const id = parseInt(idStr, 10);
    if (!id || !clear) {
        throw new Error("Invalid key format");
    }
    return { id,
        clear };
}

/**
 * @param formattedKey
 */
async function validateAPIKey(formattedKey) {
    const { id, clear } = parseFormattedKey(formattedKey);
    const bean = await R.findOne("api_key", " id = ? ", [ id ]);
    if (!bean) {
        throw new Error("API key not found");
    }
    if (!bean.active) {
        throw new Error("API key inactive");
    }
    if (!(await passwordHash.verify(clear, bean.key))) {
        throw new Error("API key invalid");
    }
    // Expiry check via model API
    const apiKeyModel = APIKey.prototype; // reuse methods
    apiKeyModel.__proto__ = bean; // temporarily bind
    if (apiKeyModel.getStatus && apiKeyModel.getStatus.call(bean) === "expired") {
        throw new Error("API key expired");
    }
    return bean;
}

/**
 * @param req
 */
function getClientIP(req) {
    const raw = req.connection?.remoteAddress || "";
    return server.getClientIPwithProxy(raw, req.headers);
}

/**
 * @param req
 * @param provided
 */
function deriveSID(req, provided) {
    if (provided && typeof provided === "string" && provided.length <= 64) {
        return provided;
    }
    const ua = req.headers["user-agent"] || "";
    return crypto.createHash("sha256").update(`${req.headers["x-forwarded-for"] || ""}|${ua}`).digest("hex").slice(0, 16);
}

/**
 * @param u
 */
function sanitizeURL(u) {
    try {
        const url = new URL(u);
        // Drop query to avoid PII in live stream, keep path + host
        return {
            full: url.href,
            origin: url.origin,
            path: url.pathname,
        };
    } catch (_) {
        return { full: u || "",
            origin: "",
            path: "" };
    }
}

router.get("/analytics.js", async (req, res) => {
    allowDevAllOrigin(res);
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");

    const k = req.query.k || "";
    const js = `(()=>{try{var s=document.currentScript;var k='${(k||"").toString().replace(/'/g, "\\'")}';if(!k&&s){k=s.getAttribute('data-key')||new URL(s.src).searchParams.get('k')||'';}if(!k){console.warn('0Code-Monit: missing data-key');return;}var sid;try{sid=localStorage.getItem('cm_sid');if(!sid){sid=Math.random().toString(36).slice(2,12);localStorage.setItem('cm_sid',sid);}}catch(e){sid=Math.random().toString(36).slice(2,12);}function send(){var u=encodeURIComponent(location.href);var r=encodeURIComponent(document.referrer||'');var t=encodeURIComponent(document.title||'');var base=(function(){try{return s&&s.src?new URL(s.src).origin:location.origin;}catch(e){return location.origin;}})();var url=base+'/collect?k='+encodeURIComponent(k)+'&u='+u+'&r='+r+'&t='+t+'&sid='+encodeURIComponent(sid);if(navigator.sendBeacon){try{navigator.sendBeacon(url);}catch(e){fetch(url,{mode:'no-cors',keepalive:true,credentials:'omit'}).catch(()=>{});}}else{fetch(url,{mode:'no-cors',keepalive:true,credentials:'omit'}).catch(()=>{});} }send();document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){send();}});window.addEventListener('pagehide',send);}catch(e){}})();`
    res.end(js);
});

router.all("/collect", express.urlencoded({ extended: false }), express.json(), async (req, res) => {
    try {
        allowDevAllOrigin(res);
        const k = (req.query.k || req.body?.k || "").toString();
        const apiKey = await validateAPIKey(k);
        const userID = apiKey.user_id;

        // const ip = await getClientIP(req);
        const ua = req.headers["user-agent"] || "";
        const urlStr = (req.query.u || req.body?.u || req.headers.referer || "").toString();
        const ref = (req.query.r || req.body?.r || "").toString();
        const title = (req.query.t || req.body?.t || "").toString().slice(0, 200);
        const sid = deriveSID(req, (req.query.sid || req.body?.sid || "").toString());
        const dt = R.isoDateTime();
        const url = sanitizeURL(urlStr);

        // Store minimal event (non-blocking)
        (async () => {
            try {
                const bean = R.dispense("analytics_event");
                bean.time = dt;
                bean.user_id = userID;
                bean.api_key_id = apiKey.id;
                bean.url = url.full;
                bean.path = url.path;
                bean.referrer = ref;
                bean.title = title;
                bean.ua = ua;
                bean.sid = sid;
                await R.store(bean);
            } catch (e) {
                // ignore store errors in live path
            }
        })();

        // Update online counters
        const now = Date.now();
        let map = onlineByUser.get(userID);
        if (!map) {
            map = new Map();
            onlineByUser.set(userID, map);
        }
        map.set(sid, now);
        const online = pruneAndCountOnline(map, now);

        // Broadcast live event
        server.io.to(userID).emit("analyticsEvent", {
            time: dt,
            url: url.full,
            path: url.path,
            origin: url.origin,
            referrer: ref,
            title,
            ua,
        });
        server.io.to(userID).emit("analyticsOnline", { online });

        res.status(204).end();
    } catch (e) {
        res.status(403).json({ ok: false });
    }
});

module.exports = router;
