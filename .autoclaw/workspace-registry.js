"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWorker = registerWorker;
exports.unregisterWorker = unregisterWorker;
exports.heartbeatWorker = heartbeatWorker;
exports.getAvailableWorkers = getAvailableWorkers;
exports.getAllWorkers = getAllWorkers;
exports.getWorkerCount = getWorkerCount;
const fs = require("fs");
const os = require("os");
const path = require("path");
const AGENT_REGISTRY_VERSION = 1;
function agentRegistryPath() {
    return path.join(os.homedir(), '.autoclaw', '.agent-registry.json');
}
function loadRegistry() {
    try {
        const raw = fs.readFileSync(agentRegistryPath(), 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.version === AGENT_REGISTRY_VERSION && Array.isArray(parsed.workers)) {
            return parsed;
        }
    }
    catch { /* missing or corrupt */ }
    return { version: AGENT_REGISTRY_VERSION, machineId: '', workers: [] };
}
function saveRegistry(reg) {
    try {
        fs.mkdirSync(path.dirname(agentRegistryPath()), { recursive: true });
        fs.writeFileSync(agentRegistryPath(), JSON.stringify(reg, null, 2), 'utf8');
    }
    catch { /* best-effort */ }
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
function registerWorker(entry) {
    const reg = loadRegistry();
    reg.workers = reg.workers.filter(w => w.pid === entry.pid ? isPidAlive(w.pid) : true);
    const now = new Date().toISOString();
    const existingIdx = reg.workers.findIndex(w => w.pid === entry.pid && w.ide === entry.ide);
    const full = { ...entry, registeredAt: now };
    if (existingIdx >= 0) {
        full.registeredAt = reg.workers[existingIdx].registeredAt;
        reg.workers[existingIdx] = full;
    }
    else {
        reg.workers.push(full);
    }
    saveRegistry(reg);
}
function unregisterWorker(pid, ide) {
    try {
        const reg = loadRegistry();
        reg.workers = reg.workers.filter(w => !(w.pid === pid && w.ide === ide));
        saveRegistry(reg);
    }
    catch { /* ignore */ }
}
function heartbeatWorker(pid, ide, status) {
    try {
        const reg = loadRegistry();
        const w = reg.workers.find(w => w.pid === pid && w.ide === ide);
        if (w) {
            w.lastHeartbeat = new Date().toISOString();
            w.status = status;
            saveRegistry(reg);
        }
    }
    catch { /* ignore */ }
}
function getAvailableWorkers() {
    const reg = loadRegistry();
    const staleThreshold = Date.now() - 5 * 60 * 1000;
    reg.workers = reg.workers.filter(w => {
        if (!isPidAlive(w.pid)) {
            return false;
        }
        return new Date(w.lastHeartbeat).getTime() > staleThreshold;
    });
    saveRegistry(reg);
    return reg.workers.filter(w => w.status === 'online');
}
function getAllWorkers() {
    const reg = loadRegistry();
    const staleThreshold = Date.now() - 5 * 60 * 1000;
    return reg.workers.filter(w => {
        if (!isPidAlive(w.pid)) {
            return false;
        }
        return new Date(w.lastHeartbeat).getTime() > staleThreshold;
    });
}
function getWorkerCount() {
    return getAvailableWorkers().length;
}
//# sourceMappingURL=workspace-registry.js.map