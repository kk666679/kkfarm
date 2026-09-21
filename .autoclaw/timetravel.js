"use strict";
/**
 * timetravel.ts — Git worktree manager and point-in-time revert.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentCommit = getCurrentCommit;
exports.getCurrentBranch = getCurrentBranch;
exports.createWorktree = createWorktree;
exports.removeWorktree = removeWorktree;
exports.listWorktrees = listWorktrees;
exports.readSnapshots = readSnapshots;
exports.writeSnapshots = writeSnapshots;
exports.recordSnapshot = recordSnapshot;
exports.planRevert = planRevert;
exports.executeRevert = executeRevert;
const path = require("path");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = require("fs");
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const fsPromises = fs.promises;
async function git(cwd, args) {
    try {
        const { stdout } = await execFileAsync('git', args, { cwd, encoding: 'utf8' });
        return stdout.trim();
    }
    catch {
        return '';
    }
}
async function getCurrentCommit(cwd) { return git(cwd, ['rev-parse', 'HEAD']); }
async function getCurrentBranch(cwd) { return git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']); }
async function createWorktree(repoRoot, branch, baseBranch = 'main') {
    const name = branch.replace(/\//g, '-');
    const wtPath = path.join(path.dirname(repoRoot), `worktree-${name}`);
    const exists = await git(repoRoot, ['rev-parse', '--verify', branch]);
    if (!exists) {
        await git(repoRoot, ['branch', branch, baseBranch]);
    }
    try {
        await execFileAsync('git', ['worktree', 'add', wtPath, branch], { cwd: repoRoot, encoding: 'utf8' });
    }
    catch (e) {
        if (!e.message?.includes('already checked out')) {
            throw e;
        }
    }
    return wtPath;
}
async function removeWorktree(repoRoot, wtPath) {
    await git(repoRoot, ['worktree', 'remove', wtPath, '--force']);
}
async function listWorktrees(repoRoot) {
    const output = await git(repoRoot, ['worktree', 'list', '--porcelain']);
    if (!output) {
        return [];
    }
    const wts = [];
    for (const block of output.split('\n\n').filter(b => b.trim())) {
        let p = '', c = '', b = '';
        for (const line of block.split('\n')) {
            if (line.startsWith('worktree ')) {
                p = line.slice(9);
            }
            if (line.startsWith('HEAD ')) {
                c = line.slice(5);
            }
            if (line.startsWith('branch ')) {
                b = line.slice(7).replace('refs/heads/', '');
            }
        }
        if (p) {
            wts.push({ path: p, branch: b, commit: c });
        }
    }
    return wts;
}
async function readSnapshots(commsDir) {
    try {
        return JSON.parse(await fsPromises.readFile(path.join(commsDir, 'snapshots.json'), 'utf8'));
    }
    catch {
        return [];
    }
}
async function writeSnapshots(commsDir, snapshots) {
    await fsPromises.writeFile(path.join(commsDir, 'snapshots.json'), JSON.stringify(snapshots, null, 2), 'utf8');
}
async function recordSnapshot(repoRoot, commsDir, partial) {
    const snap = { ...partial, commit_sha: await getCurrentCommit(repoRoot), branch: await getCurrentBranch(repoRoot) };
    const all = await readSnapshots(commsDir);
    all.push(snap);
    await writeSnapshots(commsDir, all);
    return snap;
}
async function planRevert(commsDir, snapshotId) {
    const all = await readSnapshots(commsDir);
    const target = all.find(s => s.id === snapshotId);
    if (!target) {
        return null;
    }
    const later = all.slice(all.indexOf(target) + 1);
    const branches = [...new Set(later.map(s => s.branch))];
    const tasks = later.filter(s => s.event === 'task_complete' || s.event === 'consensus_reached').map(s => s.task_id);
    const type = branches.length > 1 ? 'cascade_required' : tasks.length > 0 ? 'conflict_possible' : 'clean';
    return {
        target_snapshot: target, affected_branches: branches,
        has_downstream_dependencies: tasks.length > 0, downstream_tasks: tasks,
        revert_type: type,
        description: type === 'clean' ? `Clean revert to ${target.description}`
            : type === 'conflict_possible' ? `Revert — ${tasks.length} downstream task(s) may be affected`
                : `Cascade revert — ${branches.length} branches, ${tasks.length} tasks affected`,
    };
}
async function executeRevert(repoRoot, snapshot) {
    const branch = `revert/${snapshot.id}`;
    await git(repoRoot, ['checkout', '-b', branch, snapshot.commit_sha]);
    return branch;
}
//# sourceMappingURL=timetravel.js.map