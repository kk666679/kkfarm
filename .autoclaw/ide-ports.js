"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PER_IDE_FALLBACK_COUNT = void 0;
exports.detectIde = detectIde;
exports.getIdePorts = getIdePorts;
exports.findAvailablePortInRange = findAvailablePortInRange;
exports.allocatePorts = allocatePorts;
exports.releasePorts = releasePorts;
exports.getPortRegistry = getPortRegistry;
exports.getIDEPortBlock = getIDEPortBlock;
const crypto = require("crypto");
const fs = require("fs");
const net = require("net");
const os = require("os");
const path = require("path");
const IDE_PORT_BLOCKS = {
    vscode: { bridgeBase: 9876, kgBase: 9877 },
    cursor: { bridgeBase: 10876, kgBase: 10877 },
    kiro: { bridgeBase: 11876, kgBase: 11877 },
    windsurf: { bridgeBase: 12876, kgBase: 12877 },
    antigravity: { bridgeBase: 13876, kgBase: 13877 },
    other: { bridgeBase: 14876, kgBase: 14877 },
};
exports.PER_IDE_FALLBACK_COUNT = 4;
const PORT_REGISTRY_VERSION = 1;
function registryPath() {
    return path.join(os.homedir(), '.autoclaw', '.port-registry.json');
}
function loadRegistry() {
    try {
        const raw = fs.readFileSync(registryPath(), 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.version === PORT_REGISTRY_VERSION && Array.isArray(parsed.entries)) {
            return parsed;
        }
    }
    catch { /* missing or corrupt — start fresh */ }
    return { version: PORT_REGISTRY_VERSION, entries: [] };
}
function saveRegistry(reg) {
    try {
        fs.mkdirSync(path.dirname(registryPath()), { recursive: true });
        fs.writeFileSync(registryPath(), JSON.stringify(reg, null, 2), 'utf8');
    }
    catch { /* registry is best-effort */ }
}
function isPidAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch {
        return false;
    }
}
function isPortAvailable(port, host = '127.0.0.1') {
    return new Promise((resolve) => {
        const probe = net.createServer();
        let settled = false;
        const finish = (ok) => {
            if (settled) {
                return;
            }
            settled = true;
            try {
                probe.close();
            }
            catch { /* ignore */ }
            resolve(ok);
        };
        probe.once('error', () => finish(false));
        probe.once('listening', () => { probe.close(() => finish(true)); });
        try {
            probe.listen(port, host);
        }
        catch {
            finish(false);
        }
    });
}
function detectIde(appName) {
    const lower = appName.toLowerCase();
    if (lower.includes('cursor')) {
        return 'cursor';
    }
    if (lower.includes('kiro')) {
        return 'kiro';
    }
    if (lower.includes('windsurf')) {
        return 'windsurf';
    }
    if (lower.includes('antigravity')) {
        return 'antigravity';
    }
    if (lower.includes('code') || lower.includes('vscode')) {
        return 'vscode';
    }
    return 'other';
}
function workspaceSalt(workspacePath) {
    const h = crypto.createHash('sha1').update(workspacePath).digest();
    return h.readUInt32LE(0) % (exports.PER_IDE_FALLBACK_COUNT + 1);
}
function getIdePorts(ide, workspacePath) {
    const block = IDE_PORT_BLOCKS[ide];
    if (!workspacePath) {
        return { bridgePort: block.bridgeBase, kgPort: block.kgBase };
    }
    const salt = workspaceSalt(workspacePath);
    return {
        bridgePort: block.bridgeBase + salt,
        kgPort: block.kgBase + salt,
    };
}
async function findAvailablePortInRange(startPort, count, host = '127.0.0.1') {
    for (let i = 0; i <= count; i++) {
        const candidate = startPort + i;
        if (await isPortAvailable(candidate, host)) {
            return candidate;
        }
    }
    return null;
}
async function allocatePorts(ide, workspacePath, preferredBridgePort, preferredKgPort) {
    const block = IDE_PORT_BLOCKS[ide];
    const base = getIdePorts(ide, workspacePath);
    const startBridge = preferredBridgePort ?? base.bridgePort;
    const startKg = preferredKgPort ?? base.kgPort;
    const reg = loadRegistry();
    reg.entries = reg.entries.filter(e => {
        if (e.pid && !isPidAlive(e.pid)) {
            return false;
        }
        return true;
    });
    const usedBridgePorts = new Set(reg.entries.map(e => e.bridgePort));
    const usedKgPorts = new Set(reg.entries.map(e => e.kgPort));
    const resolvedBridge = await resolvePortInRange(block.bridgeBase, startBridge, usedBridgePorts);
    const resolvedKg = await resolvePortInRange(block.kgBase, startKg, usedKgPorts);
    const now = new Date().toISOString();
    const existingIdx = reg.entries.findIndex(e => e.ide === ide && e.workspace === workspacePath);
    const entry = {
        ide, workspace: workspacePath,
        bridgePort: resolvedBridge, kgPort: resolvedKg,
        pid: process.pid, lastSeen: now,
    };
    if (existingIdx >= 0) {
        reg.entries[existingIdx] = entry;
    }
    else {
        reg.entries.push(entry);
    }
    saveRegistry(reg);
    return { bridgePort: resolvedBridge, kgPort: resolvedKg };
}
async function resolvePortInRange(blockBase, preferredPort, usedPorts) {
    if (!usedPorts.has(preferredPort) && await isPortAvailable(preferredPort)) {
        return preferredPort;
    }
    for (let i = 0; i <= exports.PER_IDE_FALLBACK_COUNT; i++) {
        const candidate = blockBase + i;
        if (!usedPorts.has(candidate) && await isPortAvailable(candidate)) {
            return candidate;
        }
    }
    const fallback = await findAvailablePortInRange(blockBase, exports.PER_IDE_FALLBACK_COUNT);
    if (fallback !== null) {
        return fallback;
    }
    throw new Error(`No available ports in block ${blockBase}-${blockBase + exports.PER_IDE_FALLBACK_COUNT}`);
}
function releasePorts(ide, workspacePath) {
    try {
        const reg = loadRegistry();
        reg.entries = reg.entries.filter(e => !(e.ide === ide && e.workspace === workspacePath));
        saveRegistry(reg);
    }
    catch { /* ignore */ }
}
function getPortRegistry() {
    return loadRegistry();
}
function getIDEPortBlock(ide) {
    return IDE_PORT_BLOCKS[ide];
}
//# sourceMappingURL=ide-ports.js.map