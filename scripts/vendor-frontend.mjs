// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0
//
//
// vendor-frontend.mjs
//
// Sync the compiled contract outputs from the workspace's managed/ directories
// into frontend/src/contract/managed/ so Vite can bundle them.
//
// Two contracts to vendor:
//   - nighthire — main package layout (boilerplate/contract/src/managed/nighthire)
//   - escrow    — wave2 sub-package layout (boilerplate/contract/src/wave2/managed/escrow)
//
// Run after `npm run compact` in boilerplate/contract, or as part of
// `npm run dev` / the CI workflow.
//

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const TARGET_ROOT = path.join(root, 'frontend', 'src', 'contract', 'managed');

const CONTRACTS = [
  // (id, source dir relative to repo)
  { id: 'nighthire', src: path.join('boilerplate', 'contract', 'src', 'managed', 'nighthire') },
  { id: 'escrow',    src: path.join('boilerplate', 'contract', 'src', 'wave2',  'managed', 'escrow') },
];

function copyDir(s, d) {
  if (!fs.existsSync(s)) {
    console.error(`x Source not found: ${s}\n  Run \`npm run compact\` in boilerplate/contract first.`);
    process.exit(1);
  }
  fs.mkdirSync(d, { recursive: true });
  for (const e of fs.readdirSync(s, { withFileTypes: true })) {
    const sp = path.join(s, e.name);
    const dp = path.join(d, e.name);
    if (e.isDirectory()) copyDir(sp, dp);
    else if (e.isFile()) {
      fs.mkdirSync(path.dirname(dp), { recursive: true });
      fs.copyFileSync(sp, dp);
    }
  }
}

let totalFiles = 0;
for (const c of CONTRACTS) {
  const SRC = path.join(root, c.src);
  const DST = path.join(TARGET_ROOT, c.id);

  if (!fs.existsSync(SRC)) {
    console.warn(`- skip ${c.id} (no managed dir at ${SRC})`);
    continue;
  }

  console.log(`> vendoring ${c.src} -> frontend/src/contract/managed/${c.id}`);
  fs.rmSync(DST, { recursive: true, force: true });
  copyDir(SRC, DST);

  let n = 0;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else if (e.isFile()) n++;
    }
  })(DST);
  totalFiles += n;
  console.log(`  + ${n} files`);
}

console.log(`done - ${totalFiles} files vendored across ${CONTRACTS.length} contracts`);
