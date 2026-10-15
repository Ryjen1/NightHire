// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { WitnessContext } from '@midnight-ntwrk/compact-runtime';
import { type Ledger } from './managed/nighthire/contract/index.js';

// ─── Authority private state ───
// Held only by the platform admin client (signs registrations & issuances).
export type AuthorityPrivateState = {
  readonly adminKey: Uint8Array;
};

// ─── Candidate private state ───
// Held by each candidate individually on their device.
export type CandidatePrivateState = {
  readonly secretKey: Uint8Array;
  readonly rating: bigint;
  readonly completedJobs: bigint;
  readonly credentialId: Uint8Array;
  readonly credentialSalt: Uint8Array;
  readonly salaryLower: bigint;
  readonly salaryUpper: bigint;
  readonly jurisdictionHash: Uint8Array;
};

// Convenience alias for compiled-contract tests that use a single class.
export type NightHirePrivateState =
  | { readonly role: 'authority'; readonly state: AuthorityPrivateState }
  | { readonly role: 'candidate'; readonly state: CandidatePrivateState };

// ─── Constructors ───

export function createAuthorityPrivateState(adminKey: Uint8Array): AuthorityPrivateState {
  return { adminKey };
}

export function createCandidatePrivateState(
  secretKey: Uint8Array,
  rating: bigint = 5n,
  completedJobs: bigint = 12n,
  credentialId: Uint8Array = new Uint8Array(32),
  credentialSalt: Uint8Array = new Uint8Array(32),
  salaryLower: bigint = 120_000n,
  salaryUpper: bigint = 160_000n,
  jurisdictionHash: Uint8Array = new Uint8Array(32)
): CandidatePrivateState {
  return {
    secretKey,
    rating,
    completedJobs,
    credentialId,
    credentialSalt,
    salaryLower,
    salaryUpper,
    jurisdictionHash,
  };
}

// ─── Witness implementations ───
// The type narrows so the witness returns the right private state for its role.

export const witnesses = {
  localAuthorityKey: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (privateState.role !== 'authority') {
      throw new Error('localAuthorityKey can only be called by the platform authority');
    }
    return [privateState, privateState.state.adminKey];
  },

  localSecretKey: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localSecretKey can only be called by a candidate');
    }
    return [privateState, privateState.state.secretKey];
  },

  localRating: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localRating can only be called by a candidate');
    }
    return [privateState, privateState.state.rating];
  },

  localCompletedJobs: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localCompletedJobs can only be called by a candidate');
    }
    return [privateState, privateState.state.completedJobs];
  },

  localCredentialId: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localCredentialId is held by the candidate (or authority at issuance)');
    }
    return [privateState, privateState.state.credentialId];
  },

  localCredentialSalt: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localCredentialSalt is held by the candidate (or authority at issuance)');
    }
    return [privateState, privateState.state.credentialSalt];
  },

  localSalaryLower: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localSalaryLower can only be called by a candidate');
    }
    return [privateState, privateState.state.salaryLower];
  },

  localSalaryUpper: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localSalaryUpper can only be called by a candidate');
    }
    return [privateState, privateState.state.salaryUpper];
  },

  localJurisdictionHash: (
    { privateState }: WitnessContext<Ledger, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (privateState.role !== 'candidate') {
      throw new Error('localJurisdictionHash can only be called by a candidate');
    }
    return [privateState, privateState.state.jurisdictionHash];
  },
};
