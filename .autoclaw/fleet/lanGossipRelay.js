"use strict";
/**
 * lanGossipRelay.ts — LAN relay for cluster-map gossip (T1, secure-multi-host T-track).
 *
 * Bridges the E3a cluster-map gossip bus (clusterMapGossip.ClusterMapGossipBus, a
 * single-FS file bus) ACROSS hosts: it broadcasts this host's locally-originated
 * ClusterMapBeats to the LAN peers T0 discovered (+ configured seeds), and MIRRORS
 * received peer beats back INTO the same FS bus so the unchanged E3b consumer
 * (orchestratorLoop) observes them. This is the ONLY T1 place a socket is bound, and
 * it binds NOTHING unless autoclaw.cluster.lan.gossip is on AND consent is acked.
 *
 * SECURITY POSTURE (T1 = ADVISORY GOSSIP ONLY — peers are UNAUTHENTICATED until T2):
 *  - A relayed remote beat is WAKE-ONLY by construction: it lands in the FS gossip
 *    bus, where the E3b consumer treats every beat as advisory — it NEVER merges a
 *    gossiped map into the acquire base, NEVER steals/renews/elects on it, NEVER
 *    trusts it for liveness (see clusterMapGossip RemoteClusterMapTracker contract +
 *    orchestratorLoop:916-952). The wx-locked cluster-map.json stays the SOLE
 *    authority; a hostile beat causes at most a wasted board-refresh wake.
 *  - Received beats are RE-KEYED under a `lan:` origin namespace (so they can never
 *    overwrite a LOCAL window's beat file `orchestrator-loop-<hex>.json` — the
 *    keyspaces are disjoint) and RESTAMPED to a receive-clamped time (a peer can't
 *    fake freshness; a future/garbage timestamp can't linger).
 *  - Loop-free: only locally-originated beats (origin NOT starting with `lan:`) are
 *    broadcast, and inbound `lan:`-origin beats are dropped — so a beat travels
 *    exactly ONE hop (the `lan:` mark is a one-bit TTL). No ping-pong, no fan-out.
 *  - Wire-minimized: a beat carries only the already-public ClusterMap (opaque
 *    instance/agent/machine ids + ISO timestamps + integers — no workspace path,
 *    task, token, or IP); coerceClusterMap drops anything unexpected on receive.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanGossipRelay = exports.LAN_RELAY_ORIGIN_PREFIX = exports.MAX_REMOTE_ORIGINS = exports.LAN_GOSSIP_DEFAULT_BROADCAST_MS = exports.LAN_GOSSIP_DEFAULT_PORT = exports.LAN_GOSSIP_MAX_BYTES = exports.LAN_GOSSIP_VERSION = void 0;
exports.encodeClusterMapBeat = encodeClusterMapBeat;
exports.parseClusterMapBeat = parseClusterMapBeat;
exports.remoteBeatToLocal = remoteBeatToLocal;
exports.isRelayedOrigin = isRelayedOrigin;
const clusterMapGossip_1 = require("../lmd/clusterMapGossip");
const clusterMap_1 = require("../orchestrator/clusterMap");
const lanDiscovery_1 = require("./lanDiscovery");
const beacons_1 = require("./beacons");
/** Wire version of a relayed cluster-map beat (forward-compat). */
exports.LAN_GOSSIP_VERSION = 1;
/** Hard cap on a relayed beat — a larger datagram is dropped (anti-DoS). A ClusterMap
 *  with a generous fleet of standbys/monitors stays well under this. */
exports.LAN_GOSSIP_MAX_BYTES = 16384;
/** Default UDP port the relay binds/sends on — DISTINCT from discovery's 48484. */
exports.LAN_GOSSIP_DEFAULT_PORT = 48485;
/** Default broadcast/prune cadence — this host re-ships its map so peers stay fresh. */
exports.LAN_GOSSIP_DEFAULT_BROADCAST_MS = 30000;
/**
 * Hard cap on distinct relayed peer origins mirrored into the FS bus. An
 * unauthenticated peer ROTATING its `origin` could otherwise flood the gossip dir
 * with unbounded `lan_*.json` files; a stable peer re-sends the same origin (already
 * seen → overwrite), so only NEW origins past the cap are dropped.
 */
exports.MAX_REMOTE_ORIGINS = 256;
/** The `lan:` origin prefix marking a beat as relayed-from-a-remote (one-hop TTL). */
exports.LAN_RELAY_ORIGIN_PREFIX = 'lan:';
/** Sanitize an origin into the safeFrag keyspace (mirrors clusterMapGossip.safeFrag). */
function safeFrag(s) {
    return s.replace(/[^A-Za-z0-9_-]/g, '_');
}
/** Encode a beat for the wire ({v, origin, emittedAt, map}). PURE. */
function encodeClusterMapBeat(beat) {
    const wire = { v: exports.LAN_GOSSIP_VERSION, origin: beat.origin, emittedAt: beat.emittedAt, map: beat.map };
    return Buffer.from(JSON.stringify(wire), 'utf8');
}
/**
 * Parse a received datagram into a ClusterMapBeat, or null. Fail-CLOSED on anything
 * oversized/malformed/wrong-version, exactly like lanPresence.parseAnnounce and the
 * gossip parsers — a hostile/garbage packet is dropped, never trusted. coerceClusterMap
 * validates the embedded map and strips unexpected fields.
 */
function parseClusterMapBeat(raw) {
    const bytes = typeof raw === 'string' ? Buffer.byteLength(raw, 'utf8') : raw.length;
    if (bytes > exports.LAN_GOSSIP_MAX_BYTES) {
        return null;
    }
    try {
        const text = typeof raw === 'string' ? raw : raw.toString('utf8');
        const o = JSON.parse(text.replace(/^﻿/, ''));
        if (!o || typeof o !== 'object') {
            return null;
        }
        const w = o;
        if (w.v !== exports.LAN_GOSSIP_VERSION) {
            return null;
        }
        if (typeof w.origin !== 'string' || w.origin.length === 0) {
            return null;
        }
        if (typeof w.emittedAt !== 'string' || w.emittedAt.length === 0) {
            return null;
        }
        const map = (0, clusterMap_1.coerceClusterMap)(w.map);
        if (!map) {
            return null;
        }
        return { origin: w.origin, emittedAt: w.emittedAt, map };
    }
    catch {
        return null;
    }
}
/**
 * Project a RECEIVED beat into a local FS-bus beat. PURE. Re-keys the origin under the
 * `lan:` namespace (collision-disjoint from local `orchestrator-loop-*` files) and
 * CLAMPS the emittedAt into [now-staleMs, now] so a peer cannot fake freshness, a
 * future/garbage timestamp cannot linger, and a genuinely stale map ages out promptly.
 */
function remoteBeatToLocal(beat, now, staleMs = clusterMapGossip_1.CLUSTER_MAP_BEAT_STALE_MS) {
    const parsed = Date.parse(beat.emittedAt);
    const base = Number.isFinite(parsed) ? parsed : now;
    const stamped = Math.min(Math.max(base, now - staleMs), now);
    return {
        origin: `${exports.LAN_RELAY_ORIGIN_PREFIX}${safeFrag(beat.origin)}`,
        emittedAt: new Date(stamped).toISOString(),
        map: beat.map,
    };
}
/** True if a beat origin is a relayed-remote one (never re-broadcast / never re-accepted). */
function isRelayedOrigin(origin) {
    return origin.startsWith(exports.LAN_RELAY_ORIGIN_PREFIX);
}
/** Default factory: a LAZY node:dgram socket. Never evaluated until start() runs. */
function defaultSocketFactory(opts) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const dgram = require('node:dgram');
    return dgram.createSocket(opts);
}
/**
 * The LAN cluster-map gossip relay. Constructing it binds NOTHING — only start()
 * (after the flag+consent gate) creates a socket. Idempotent start()/stop().
 */
class LanGossipRelay {
    constructor(opts) {
        this.socket = null;
        this.timer = null;
        this.started = false;
        /** In-flight mirror writes + broadcast ticks — exposed via drain() so a caller/test can flush. */
        this.inflight = new Set();
        /** Distinct relayed origins mirrored this lifetime — bounds `lan_*` file creation. */
        this.seenOrigins = new Set();
        this.opts = opts;
        this.createSocket = opts.createSocket ?? defaultSocketFactory;
        this.now = opts.now ?? Date.now;
        this.staleMs = opts.staleMs ?? clusterMapGossip_1.CLUSTER_MAP_BEAT_STALE_MS;
        // No selfOrigin on the bus: broadcastLocalBeats reads ALL local beats (incl. this
        // host's own map) and filters by the `lan:` prefix; the inbound path skips echoes.
        this.bus = new clusterMapGossip_1.ClusterMapGossipBus(opts.workspaceRoot, { staleMs: this.staleMs });
    }
    /** True once start() has bound a socket (until stop()). */
    isRunning() { return this.started; }
    /** Await any in-flight mirrored-beat writes (graceful shutdown / test flush). */
    async drain() { await Promise.allSettled([...this.inflight]); }
    /**
     * Bind the socket, wire the receive handler, broadcast once, then on the interval
     * (which also prunes long-dead `lan:` beat files so reclamation does not depend on
     * the E3b flag). Idempotent; gated; best-effort (a bind error is logged, never thrown).
     */
    start() {
        if (this.started) {
            return;
        }
        // Defense-in-depth: refuse to bind unless the flag is on AND consent is acked.
        if (!(0, lanDiscovery_1.shouldStartLanDiscovery)({ enabled: this.opts.enabled, consentAckAt: this.opts.consentAckAt })) {
            return;
        }
        this.started = true;
        let socket;
        try {
            socket = this.createSocket({ type: 'udp4', reuseAddr: true });
        }
        catch (err) {
            this.started = false;
            this.logErr('socket create failed', err);
            return;
        }
        this.socket = socket;
        socket.on('message', (msg, rinfo) => this.onDatagram(msg, rinfo.address));
        socket.on('error', (err) => this.logErr('socket error', err));
        try {
            socket.bind(this.opts.port);
        }
        catch (err) {
            this.logErr('bind failed', err);
        }
        this.runTick();
        const intervalMs = this.opts.broadcastIntervalMs ?? exports.LAN_GOSSIP_DEFAULT_BROADCAST_MS;
        this.timer = setInterval(() => this.runTick(), intervalMs);
    }
    /** Run one tick, tracked in `inflight` so drain() can flush its broadcast deterministically. */
    runTick() {
        const p = this.tick();
        this.inflight.add(p);
        void p.finally(() => this.inflight.delete(p)).catch(() => undefined);
    }
    /** One relay cycle: broadcast local beats to peers, then prune dead `lan:` files. */
    async tick() {
        try {
            await this.broadcastLocalBeats();
        }
        catch (err) {
            this.logErr('broadcast failed', err);
        }
        try {
            await this.bus.pruneStale(this.now());
        }
        catch (err) {
            this.logErr('prune failed', err);
        }
    }
    /**
     * Send every LOCALLY-originated fresh beat (origin NOT `lan:`) to each peer. Targets
     * are the T0-discovered peer IPs (origin-'lan' beacons) + configured seed hosts, each
     * dialed on the gossip port (a peer's announced beacon port is its DISCOVERY port).
     */
    async broadcastLocalBeats() {
        if (!this.socket) {
            return;
        }
        const now = this.now();
        const beats = await this.bus.readBeats(now);
        const local = beats.filter((b) => !isRelayedOrigin(b.origin));
        if (local.length === 0) {
            return;
        }
        const targets = await this.peerTargets();
        if (targets.length === 0) {
            return;
        }
        for (const beat of local) {
            const payload = encodeClusterMapBeat(beat);
            if (payload.length > exports.LAN_GOSSIP_MAX_BYTES) {
                this.logErr('beat too large to relay', beat.origin);
                continue;
            }
            for (const host of targets) {
                try {
                    this.socket.send(payload, this.opts.port, host, (err) => { if (err) {
                        this.logErr('send failed', err);
                    } });
                }
                catch (err) {
                    this.logErr('send threw', err);
                }
            }
        }
    }
    /**
     * Unique peer HOSTS to dial (discovered origin-'lan' beacons + seeds), gossip-port
     * applied. Reads ONLY the WORKSPACE beacon dir — T0b writes LAN-discovered peers
     * there (scope 'workspace'); the machine-global dir holds unrelated cross-tool
     * beacons that are not LAN peers for this project.
     */
    async peerTargets() {
        const hosts = new Set();
        try {
            const rows = await (0, beacons_1.readBeacons)((0, beacons_1.workspaceBeaconDir)(this.opts.commsDir), { now: this.now() });
            for (const r of rows) {
                if (r.origin !== 'lan' || !r.endpoint) {
                    continue;
                }
                const host = hostOf(r.endpoint);
                if (host) {
                    hosts.add(host);
                }
            }
        }
        catch (err) {
            this.logErr('readBeacons failed', err);
        }
        for (const s of this.opts.seeds) {
            if (s.host) {
                hosts.add(s.host);
            }
        }
        return [...hosts];
    }
    /** Clear the timer + close the socket. Idempotent. */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.socket) {
            try {
                this.socket.close();
            }
            catch { /* already closed */ }
            this.socket = null;
        }
        this.started = false;
    }
    /**
     * Handle one received beat. Fail-closed: a packet that does not parse, our OWN beat
     * echoed back, or an already-relayed (`lan:`) beat writes nothing — the last two are
     * the one-hop loop guard. A valid foreign beat is re-keyed + receive-clamped and
     * MIRRORED into the FS gossip bus, where the wake-only consumer observes it.
     */
    onDatagram(raw, _sourceAddr) {
        const beat = parseClusterMapBeat(raw);
        if (!beat) {
            return;
        }
        if (this.opts.selfOrigin && beat.origin === this.opts.selfOrigin) {
            return;
        }
        if (isRelayedOrigin(beat.origin)) {
            return;
        } // reject re-relays → one-hop only
        const localBeat = remoteBeatToLocal(beat, this.now(), this.staleMs);
        // Bound mirrored files against an origin-rotating flood (a stable peer re-uses its
        // origin → already seen → overwrite; only NEW origins past the cap are dropped).
        if (!this.seenOrigins.has(localBeat.origin)) {
            if (this.seenOrigins.size >= exports.MAX_REMOTE_ORIGINS) {
                this.logErr('remote origin cap reached, dropping', beat.origin);
                return;
            }
            this.seenOrigins.add(localBeat.origin);
        }
        const p = this.bus.publish(localBeat)
            .then(() => undefined)
            .catch((err) => this.logErr('mirror publish failed', err));
        this.inflight.add(p);
        void p.finally(() => this.inflight.delete(p)).catch(() => undefined);
    }
    logErr(what, err) {
        const msg = err instanceof Error ? err.message : String(err);
        try {
            this.opts.log?.(`[lan-gossip] ${what}: ${msg}`);
        }
        catch { /* a broken sink never crashes the relay */ }
    }
}
exports.LanGossipRelay = LanGossipRelay;
/** Extract the HOST from a beacon `endpoint` ("host:port" or "host"); '' if empty. */
function hostOf(endpoint) {
    const s = endpoint.trim();
    if (s.length === 0) {
        return '';
    }
    const colon = s.lastIndexOf(':');
    // Reject IPv6-ish (more than one colon) — out of T0/T1 scope, like parseSeeds.
    if (colon >= 0 && s.indexOf(':') === colon) {
        return s.slice(0, colon);
    }
    if (colon >= 0) {
        return '';
    }
    return s;
}
//# sourceMappingURL=lanGossipRelay.js.map