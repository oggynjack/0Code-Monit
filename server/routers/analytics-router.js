const express = require("express");
const { R } = require("redbean-node");
const { CodeMonitServer } = require("../0Code-Monit-server");
const passwordHash = require("../password-hash");
const { allowDevAllOrigin } = require("../util-server");
const crypto = require("crypto");
const APIKey = require("../model/api_key");

const router = express.Router();
const server = CodeMonitServer.getInstance();

// Per-user online visitor last-seen map: Map<userID, Map<sid, lastSeenEpochMs>>
const onlineByUser = new Map();

// In-memory key verification cache to avoid expensive bcrypt/DB queries on every beacon
// Map<formattedKey, { bean: object, expiry: number }>
const apiKeyCache = new Map();
const KEY_CACHE_TTL_MS = 60 * 1000;

// Batch queue for high-throughput non-blocking writes
let eventQueue = [];
const BATCH_FLUSH_INTERVAL_MS = 3000;
const MAX_BATCH_SIZE = 50;

async function flushEventQueue() {
    if (eventQueue.length === 0) {
        return;
    }
    const batch = eventQueue.splice(0, eventQueue.length);
    try {
        for (const item of batch) {
            const bean = R.dispense("analytics_event");
            bean.time = item.time;
            bean.user_id = item.user_id;
            bean.api_key_id = item.api_key_id;
            bean.url = item.url;
            bean.path = item.path;
            bean.referrer = item.referrer;
            bean.title = item.title;
            bean.ua = item.ua;
            bean.sid = item.sid;
            await R.store(bean);
        }
    } catch (err) {
        // Fallback or log if needed, do not crash
    }
}

// Background batch flush timer
setInterval(() => {
    flushEventQueue().catch(() => {});
}, BATCH_FLUSH_INTERVAL_MS);

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
 * Parses API key supporting cm (0Code-Monit) and legacy prefixes
 * @param {string} k
 */
function parseFormattedKey(k) {
    if (typeof k !== "string") {
        throw new Error("Invalid key format");
    }
    const match = k.match(/^(?:cm|0cm|uk)(\d+)_(.+)$/);
    if (!match) {
        throw new Error("Invalid key format");
    }
    const id = parseInt(match[1], 10);
    const clear = match[2];
    if (!id || !clear) {
        throw new Error("Invalid key format");
    }
    return { id, clear };
}

/**
 * Validates API key with in-memory TTL caching
 * @param {string} formattedKey
 */
async function validateAPIKey(formattedKey) {
    const cached = apiKeyCache.get(formattedKey);
    const now = Date.now();
    if (cached && cached.expiry > now) {
        return cached.bean;
    }

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
    const apiKeyModel = APIKey.prototype;
    apiKeyModel.__proto__ = bean;
    if (apiKeyModel.getStatus && apiKeyModel.getStatus.call(bean) === "expired") {
        throw new Error("API key expired");
    }

    apiKeyCache.set(formattedKey, {
        bean,
        expiry: now + KEY_CACHE_TTL_MS,
    });

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
        return {
            full: url.href,
            origin: url.origin,
            path: url.pathname,
        };
    } catch (_) {
        return {
            full: u || "",
            origin: "",
            path: "",
        };
    }
}

router.get("/analytics.js", async (req, res) => {
    allowDevAllOrigin(res);
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");

    const k = req.query.k || "";
    const js = `(()=>{try{var s=document.currentScript;var k='${(k||"").toString().replace(/'/g, "\\'")}';if(!k&&s){k=s.getAttribute('data-key')||new URL(s.src).searchParams.get('k')||'';}if(!k){console.warn('0Code-Monit: missing data-key');return;}var sid;try{sid=localStorage.getItem('cm_sid');if(!sid){sid=Math.random().toString(36).slice(2,12);localStorage.setItem('cm_sid',sid);}}catch(e){sid=Math.random().toString(36).slice(2,12);}function send(){var u=encodeURIComponent(location.href);var r=encodeURIComponent(document.referrer||'');var t=encodeURIComponent(document.title||'');var base=(function(){try{return s&&s.src?new URL(s.src).origin:location.origin;}catch(e){return location.origin;}})();var url=base+'/collect?k='+encodeURIComponent(k)+'&u='+u+'&r='+r+'&t='+t+'&sid='+encodeURIComponent(sid);if(navigator.sendBeacon){try{navigator.sendBeacon(url);}catch(e){fetch(url,{mode:'no-cors',keepalive:true,credentials:'omit'}).catch(()=>{});}}else{fetch(url,{mode:'no-cors',keepalive:true,credentials:'omit'}).catch(()=>{});} }send();document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden'){send();}});window.addEventListener('pagehide',send);}catch(e){}})();`;
    res.end(js);
});

router.all("/collect", express.urlencoded({ extended: false }), express.json(), async (req, res) => {
    try {
        allowDevAllOrigin(res);
        const k = (req.query.k || req.body?.k || "").toString();
        const apiKey = await validateAPIKey(k);
        const userID = apiKey.user_id;

        const ua = req.headers["user-agent"] || "";
        const urlStr = (req.query.u || req.body?.u || req.headers.referer || "").toString();
        const ref = (req.query.r || req.body?.r || "").toString();
        const title = (req.query.t || req.body?.t || "").toString().slice(0, 200);
        const sid = deriveSID(req, (req.query.sid || req.body?.sid || "").toString());
        const dt = R.isoDateTime();
        const url = sanitizeURL(urlStr);

        // Queue event for batched non-blocking flush
        eventQueue.push({
            time: dt,
            user_id: userID,
            api_key_id: apiKey.id,
            url: url.full,
            path: url.path,
            referrer: ref,
            title,
            ua,
            sid,
        });

        if (eventQueue.length >= MAX_BATCH_SIZE) {
            flushEventQueue().catch(() => {});
        }

        // Update online counters
        const now = Date.now();
        let map = onlineByUser.get(userID);
        if (!map) {
            map = new Map();
            onlineByUser.set(userID, map);
        }
        map.set(sid, now);
        const online = pruneAndCountOnline(map, now);

        // Broadcast live event via websocket
        if (server.io) {
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
        }

        res.status(204).end();
    } catch (e) {
        res.status(403).json({ ok: false });
    }
});

module.exports = router;
