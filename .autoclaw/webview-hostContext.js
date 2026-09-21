"use strict";
/**
 * webview-hostContext.ts — the daemon/host-side gatherers the panel footer needs
 * (CP-3.0). These read the filesystem (extension version from package.json, git
 * branch from .git/HEAD), so they are DELIBERATELY here and not in
 * `webview-render.ts`: that render module must stay browser-safe (no `fs`/`path`/
 * `vscode`) so the same source can be bundled for the M3 web UI. The host reads
 * these once and passes the values as parameters to the pure renderers
 * (`renderPanelFooter(version, branch)`).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readExtensionVersionFromDisk = readExtensionVersionFromDisk;
exports.readGitBranchFromDisk = readGitBranchFromDisk;
const fs = require("fs");
const path = require("path");
/** Read extension version from package.json. Null if missing/malformed. */
function readExtensionVersionFromDisk(extensionFsPath) {
    try {
        const raw = fs.readFileSync(path.join(extensionFsPath, 'package.json'), 'utf8');
        const pkg = JSON.parse(raw);
        return typeof pkg.version === 'string' && pkg.version.length > 0 ? pkg.version : null;
    }
    catch {
        return null;
    }
}
/** Read current git branch from .git/HEAD. Null on detached HEAD / no repo. */
function readGitBranchFromDisk(workspaceRoot) {
    try {
        const head = fs.readFileSync(path.join(workspaceRoot, '.git', 'HEAD'), 'utf8').trim();
        const m = head.match(/^ref:\s+refs\/heads\/(.+)$/);
        return m ? m[1] : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=webview-hostContext.js.map