// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { describe, it, expect } from 'vitest';
import { contracts, witnesses } from '@midnight-ntwrk/contract';

const NightHireModule = (contracts as any).NightHire;
const Contract = NightHireModule.Contract;
const ledgerDecoder = NightHireModule.ledger;
import fs from 'node:fs';
import path from 'node:path';

describe('NightHire contract — compile artifacts', () => {
  it('exposes the contract module via the @midnight-ntwrk/contract export', () => {
    expect(contracts).toBeTruthy();
    const names = Object.keys(contracts);
    expect(names.length).toBeGreaterThan(0);
    expect(names).toContain('NightHire');
  });

  it('declares all 9 exported circuits in the contract module', () => {
    const contractModule = (contracts as any).NightHire;
    const circuits = contractModule.Contract as any;
    const impureCircuits = new circuits(witnesses as any).impureCircuits;
    const names = Object.keys(impureCircuits);
    expect(names).toEqual(
      expect.arrayContaining([
        'register',
        'issueCredential',
        'submitRating',
        'proveMinRating',
        'proveMinJobs',
        'proveRegistered',
        'proveCredential',
        'proveSalaryFits',
        'proveJurisdiction',
      ]),
    );
    expect(names.length).toBeGreaterThanOrEqual(9);
  });

  it('declares all 9 witnesses', () => {
    const witnessNames = Object.keys(witnesses);
    expect(witnessNames).toEqual(
      expect.arrayContaining([
        'localAuthorityKey',
        'localSecretKey',
        'localRating',
        'localCompletedJobs',
        'localCredentialId',
        'localCredentialSalt',
        'localSalaryLower',
        'localSalaryUpper',
        'localJurisdictionHash',
      ]),
    );
  });

  it('produces prover + verifier keys for every exported circuit', () => {
    const keysDir = path.resolve(
      __dirname, '..', '..', '..', 'contract', 'src', 'managed', 'nighthire', 'keys'
    );
    expect(fs.existsSync(keysDir)).toBe(true);
    const expectedCircuits = [
      'register', 'issueCredential', 'submitRating',
      'proveMinRating', 'proveMinJobs', 'proveRegistered',
      'proveCredential', 'proveSalaryFits', 'proveJurisdiction',
    ];
    for (const circuit of expectedCircuits) {
      const proverPath = path.join(keysDir, `${circuit}.prover`);
      const verifierPath = path.join(keysDir, `${circuit}.verifier`);
      expect(fs.existsSync(proverPath), `missing prover for ${circuit}`).toBe(true);
      expect(fs.existsSync(verifierPath), `missing verifier for ${circuit}`).toBe(true);
      const proverStat = fs.statSync(proverPath);
      expect(proverStat.size).toBeGreaterThan(1024); // > 1 KiB
    }
  });

  it('instantiates the Contract class with all witnesses', () => {
    const c = new Contract(witnesses);
    expect(c.impureCircuits.register).toBeDefined();
    expect(c.impureCircuits.issueCredential).toBeDefined();
    expect(c.impureCircuits.proveSalaryFits).toBeDefined();
    expect(c.impureCircuits.proveJurisdiction).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════════════
// Wave 3 — Regression / negative-path invariants.
//
// These tests are written against the source text of `nighthire.compact`
// rather than instantiating a full Midnight.js runtime (which would
// require Docker + a funded testnet wallet). They catch the exact
// regressions that knocked NightHire out of Wave 1:
//
//   - proveMinRating / proveMinJobs that compile but do not actually
//     read the witness (a no-op `return disclose(threshold)` was the
//     Wave 1 bug).
//   - proveSalaryFits that only checks one direction of the band
//     overlap (the "Candidate min above job max" assertion alone
//     can be satisfied by a degenerate band of [0, MAX]).
//
// Every test below is small, deterministic, and runs in <100 ms.
// ════════════════════════════════════════════════════════════════════════

describe('NightHire contract — source-level negative-path invariants (Wave 3)', () => {
  const compactSrc = fs.readFileSync(
    path.resolve(__dirname, '..', '..', '..', 'contract', 'src', 'nighthire.compact'),
    'utf-8',
  );

  function extractCircuitBody(name: string): string {
    const re = new RegExp(`export\\s+circuit\\s+${name}\\s*\\([^)]*\\)[^]*?\\n\\}`, 'm');
    const m = compactSrc.match(re);
    if (!m) throw new Error(`Could not locate circuit body for ${name} in nighthire.compact`);
    return m[0];
  }

  it('proveMinRating still asserts the local rating against the threshold (Wave 1 regression guard)', () => {
    const body = extractCircuitBody('proveMinRating');
    expect(body, 'Wave 1 regression: proveMinRating must read localRating').toMatch(/localRating\s*\(/);
    expect(body).toMatch(/assert\s*\([^)]*threshold/i);
    expect(body).toMatch(/>=/);
    expect(body.length).toBeGreaterThan(80);
  });

  it('proveMinJobs still asserts the local completed-jobs against the threshold (Wave 1 regression guard)', () => {
    const body = extractCircuitBody('proveMinJobs');
    expect(body, 'Wave 1 regression: proveMinJobs must read localCompletedJobs').toMatch(/localCompletedJobs\s*\(/);
    expect(body).toMatch(/assert\s*\([^)]*threshold/i);
    expect(body).toMatch(/>=/);
    expect(body.length).toBeGreaterThan(80);
  });

  it('proveSalaryFits asserts BOTH bounds of the candidate band (degenerate-band guard)', () => {
    const body = extractCircuitBody('proveSalaryFits');
    expect(body).toMatch(/localSalaryLower/);
    expect(body).toMatch(/localSalaryUpper/);
    const asserts = body.match(/assert\s*\([^)]*\)/g) ?? [];
    expect(asserts.length).toBeGreaterThanOrEqual(2);
    expect(body).toMatch(/jobUpper/);
    expect(body).toMatch(/jobLower/);
  });

  it('issueCredential uses BOTH credentialId and credentialSalt (single-key regression guard)', () => {
    const body = extractCircuitBody('issueCredential');
    expect(body).toMatch(/localCredentialId\s*\(/);
    expect(body).toMatch(/localCredentialSalt\s*\(/);
    expect(body).toMatch(/persistentHash\s*<\s*Vector\s*<\s*3\s*,/);
  });

  it('every exported circuit writes at least one ledger cell (proof-skip regression guard)', () => {
    const exportCircuitRe = /export\s+circuit\s+\w+\s*\([^)]*\)[^]*?\n\}/g;
    const bodies = compactSrc.match(exportCircuitRe) ?? [];
    expect(bodies.length).toBeGreaterThanOrEqual(9);
    for (const body of bodies) {
      const writesLedger = /sequence\s*\.\s*increment\s*\(/.test(body)
        || /\.\s*insert\s*\(/.test(body);
      expect(writesLedger, `export circuit body has no ledger write boundary: ${body.slice(0, 80)}…`).toBe(true);
    }
  });

  it('proof:true flag is set for every exported circuit in contract-info.json', () => {
    const infoPath = path.resolve(
      __dirname, '..', '..', '..', 'contract', 'src', 'managed', 'nighthire', 'compiler', 'contract-info.json'
    );
    if (!fs.existsSync(infoPath)) {
      // Skip rather than fail if the artifacts haven't been compiled locally.
      return;
    }
    const info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    const circuits = info?.circuits ?? info?.entries ?? [];
    expect(circuits.length).toBeGreaterThanOrEqual(9);
    for (const c of circuits) {
      const name = c?.name ?? c?.circuit ?? '';
      if (!name) continue;
      expect(c?.proof === true || c?.proofs?.zk?.proof === true, `Circuit ${name} does not have proof:true in contract-info.json`).toBe(true);
    }
  });
});
