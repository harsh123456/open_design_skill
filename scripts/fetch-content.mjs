#!/usr/bin/env node
// Fetch (or refresh) the bundled Open Design content snapshot into <skill-dir>/repo.
// Shallow-clones https://github.com/nexu-io/open-design and strips .git so the
// skill stays self-contained.
//
// Usage: node scripts/fetch-content.mjs [--force]
//   --force  replace an existing repo/ snapshot

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { BUNDLED_ROOT } from './_parse.mjs';

const SOURCE = 'https://github.com/nexu-io/open-design';
const force = process.argv.includes('--force');

if (fs.existsSync(BUNDLED_ROOT)) {
  if (!force) {
    console.log(`Already present: ${BUNDLED_ROOT} (use --force to refresh)`);
    process.exit(0);
  }
  fs.rmSync(BUNDLED_ROOT, { recursive: true, force: true });
}

const tmp = `${BUNDLED_ROOT}.tmp-${process.pid}`;
console.log(`Cloning ${SOURCE} (depth 1)…`);
const r = spawnSync('git', ['clone', '--depth', '1', SOURCE, tmp], { stdio: 'inherit' });
if (r.status !== 0) {
  fs.rmSync(tmp, { recursive: true, force: true });
  console.error('ERROR: git clone failed (is git on PATH and the network reachable?)');
  process.exit(r.status ?? 1);
}
fs.rmSync(`${tmp}/.git`, { recursive: true, force: true });
fs.renameSync(tmp, BUNDLED_ROOT);
console.log(`Open Design content ready at ${BUNDLED_ROOT}`);
