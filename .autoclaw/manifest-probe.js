"use strict";
/**
 * manifest-probe.ts — Lightweight orchestrator manifest detection.
 *
 * Pulled out of extension.ts so it can be unit-tested without booting
 * the vscode test harness. Used by the bridge auto-start gate.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasOrchestratorManifest = hasOrchestratorManifest;
const fs = require("fs");
const path = require("path");
const fsPromises = fs.promises;
/**
 * True when the supplied workspace root contains at least one orchestrator
 * task manifest (a YAML file under .autoclaw/orchestrator/manifests/).
 */
async function hasOrchestratorManifest(workspaceRoot) {
    if (!workspaceRoot) {
        return false;
    }
    const dir = path.join(workspaceRoot, '.autoclaw', 'orchestrator', 'manifests');
    try {
        const files = await fsPromises.readdir(dir);
        return files.some(f => /\.ya?ml$/i.test(f));
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=manifest-probe.js.map