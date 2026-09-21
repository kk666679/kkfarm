const { execSync } = require('child_process');

const checks = [
  { name: 'Node.js', command: 'node --version' },
  { name: 'npm', command: 'npm --version' },
  { name: 'Docker', command: 'docker --version', optional: true },
  { name: 'ADB', command: 'adb version', optional: true },
  { name: 'KVM', command: 'ls /dev/kvm 2>/dev/null || echo "not found"', optional: true },
];

const results = [];

for (const check of checks) {
  try {
    const output = execSync(check.command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
    const detail = output.split('\n')[0] ?? '';
    results.push({ name: check.name, status: 'ok', detail });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const detail = message.split('\n')[0] ?? message;
    if (check.optional) {
      results.push({ name: check.name, status: 'warn', detail });
    } else {
      results.push({ name: check.name, status: 'error', detail });
    }
  }
}

console.log('Device Farm Doctor\n');
for (const result of results) {
  const symbol = result.status === 'ok' ? '✓' : result.status === 'warn' ? '?' : '✗';
  console.log(`${symbol} ${result.name}: ${result.detail}`);
}

const failed = results.filter(r => r.status === 'error').length;
if (failed > 0) {
  console.log(`\n${failed} required check(s) failed.`);
  process.exit(1);
}
console.log('\nAll required checks passed.');
