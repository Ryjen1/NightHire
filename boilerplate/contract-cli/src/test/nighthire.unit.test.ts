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

  it('declares all 8 exported circuits in the contract module', () => {
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
