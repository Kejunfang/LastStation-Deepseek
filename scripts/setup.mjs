/* One-time local setup: point git at the committed hooks and verify deps. */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
process.chdir(ROOT);

try {
  execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
} catch {
  console.error('Not a git repository. Run: git init -b main');
  process.exit(1);
}

execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'inherit' });
fs.chmodSync(path.join(ROOT, '.githooks/pre-commit'), 0o755);

console.log('git hooks enabled: .githooks/pre-commit');
console.log('  every commit now runs the static + browser test suite.');

if (!fs.existsSync(path.join(ROOT, 'node_modules/playwright'))) {
  console.log('\nDependencies are not installed yet. Run:\n  npm install');
} else {
  console.log('\nDependencies look installed. Run:\n  npm test');
}
