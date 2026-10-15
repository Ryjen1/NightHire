// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

//
// vendor-frontend.mjs
//
// Sync the compiled contract outputs from
// boilerplate/contract/src/managed/nighthire/ into
// frontend/src/contract/managed/nighthire/ so Vite can bundle them.
//
// Triggered as part of `npm run dev` / `node scripts/deploy.mjs`.
//

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SRC = path.join(root, 'boilerplate', 'contract', 'src', 'managed', 'nighthire');
const DST = path.join(root, 'frontend',    'src',       'contract', 'managed', 'nighthire');

function copyDir(s, d) {
  if (!fs.existsSync(s)) {
    console.error(`❌ Source not found: ${s}\n   Run \`npm run compact\` in boilerplate/contract first.`);
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

console.log(`▸ vendoring ${SRC} -> ${DST}`);
// Wipe the destination first so stale files don't linger.
fs.rmSync(DST, { recursive: true, force: true });
copyDir(SRC, DST);

const fileCount = (() => {
  let n = 0;
  function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name));
      else if (e.isFile()) n++;
    }
  }
  walk(DST);
  return n;
})();
console.log(`✓ vendored ${fileCount} files`);
