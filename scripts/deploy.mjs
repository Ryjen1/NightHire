// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import path from 'node:path';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const root = path.resolve(new URL(import.meta.url).pathname, '..');
process.chdir(root);

function run(cmd, args, opts = {}) {
  console.log(`\n$ ${cmd} ${args.join(' ')}`);
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log('🚀 NightHire — build + deploy helper');

// 1. Build the contract (so the frontend vendors the latest compiled outputs).
console.log('\n=== Step 1/4: compile the Compact contract ===');
run('npm', ['run', '--prefix', 'boilerplate/contract', 'compact']);

console.log('\n=== Step 2/4: vendor compiled outputs into frontend/src/contract ===');
run('node', ['scripts/vendor-frontend.mjs']);

// 3. Build the frontend (Vite).
console.log('\n=== Step 3/4: vite build (frontend) ===');
run('npm', ['run', '--prefix', 'frontend', 'build']);

const distPath = path.join(root, 'frontend', 'dist');
if (!fs.existsSync(distPath)) {
  console.error(`❌ Expected ${distPath} after vite build but it is missing.`);
  process.exit(1);
}
console.log(`✓ frontend/dist/ built (${fs.readdirSync(distPath).length} files)`);

// 3. Deploy.
const target = process.argv[2] || 'vercel';
if (target === 'vercel') {
  console.log('\n=== Step 4/4: vercel --prod ===');
  // vercel CLI ships with Vercel (https://vercel.com/docs/cli).
  // First run: `npx vercel login` then `npx vercel link`. After that,
  // subsequent deploys from this machine don't require interactive auth.
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  run(npx, ['vercel', '--prod', '--yes', '--no-warnings']);
} else if (target === 'netlify') {
  console.log('\n=== Step 3/3: netlify deploy ===');
  run('npx', ['netlify', 'deploy', '--prod', '--dir=frontend/dist']);
} else if (target === 'gh-pages') {
  console.log('\n=== Step 3/3: gh-pages ===');
  run('npx', ['gh-pages', '-d', 'frontend/dist']);
} else {
  console.error(`Unknown target: ${target}\n  usage: node scripts/deploy.mjs [vercel|netlify|gh-pages]`);
  process.exit(1);
}

console.log('\n✅ Deploy complete. Check the AKINDO project page for the live URL.');
