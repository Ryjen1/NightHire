// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

//
// NightHire runtime — runs the compiled Compact contract in the browser
// via the Midnight Compact runtime primitives.
//
// This module loads the *real* compiled contract (no fakes) and exposes
// pure-JS circuit calls. The browser-side execution proves witnesses,
// enforces assertions, updates the ledger, and emits public outputs.
// For a full ZK-SNARK proof artifact, deploy to testnet and use the
// Midnight HTTP proof server; the demo UI exposes both modes.
//

import {
  createCircuitContext,
  createConstructorContext,
  dummyContractAddress,
  type WitnessContext,
  type CircuitContext,
} from '@midnight-ntwrk/compact-runtime';

const COIN_PUB = '00'.repeat(32);    // placeholder coin public key (in-browser local run)
const ADDR     = dummyContractAddress();  // placeholder ContractAddress for local-mode runtime

// Type-erased import of the auto-generated contract module. The compiler
// emits a typed `Contract` class with `impureCircuits` and provable keys;
// we keep the surface tiny so the runtime shape is easy to swap out.
//
// IMPORTANT: this import is wrapped in a lazy getter so that any failure
// inside the auto-generated contract module (e.g. a top-level
// `checkRuntimeVersion` mismatch with the onchain-runtime version that
// shipped in the Vite bundle) does NOT crash the entire React tree. The
// `runtimeReady` flag is what the UI uses to know whether circuits can
// actually be called.
export const NightHireContract: any = null;  // resolved lazily via loadNightHireRuntime()
export const ledgerDecoder: any = null;
export const runtimeError: string | null = null;
export const runtimeReady: boolean = false;

let resolved: { Contract: any; ledger: any; error: string | null; ready: boolean } | null = null;

export async function loadNightHireRuntime(): Promise<typeof resolved> {
  if (resolved) return resolved;
  try {
    const mod = await import('../contract/managed/nighthire/contract/index.js');
    resolved = { Contract: (mod as any).Contract, ledger: (mod as any).ledger, error: null, ready: true };
    return resolved;
  } catch (e: any) {
    resolved = { Contract: null, ledger: null, error: e?.message || String(e), ready: false };
    console.error('NightHire: compiled contract module failed to load', e);
    return resolved;
  }
}

// ---------------------------------------------------------------------------
// Witness provider — backs every circuit with real witness values.
//
// Two roles are modelled:
//   - 'authority' holds the admin key used by register, issueCredential
//   - 'candidate' holds all the private fields (rating, salary, etc.)
//
// Private state lives in localStorage so reloading the page keeps the same
// candidate identity (and so screenshots of "proofs" actually reflect
// the candidate's real self-asserted values).
// ---------------------------------------------------------------------------

export type AuthorityPrivateState = {
  readonly adminKey: Uint8Array;
};
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
export type NightHirePrivateState =
  | { readonly role: 'authority'; readonly state: AuthorityPrivateState }
  | { readonly role: 'candidate'; readonly state: CandidatePrivateState };

export const PRIVATE_STATE_KEY = 'nighthire.private-state.v1';

function randomBytes(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < n; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  return buf;
}

function bytesToHex(b: Uint8Array): string {
  return Array.from(b)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}
function hexToBytes(h: string): Uint8Array {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}

export function loadPrivateState(): NightHirePrivateState | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(PRIVATE_STATE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NightHirePrivateState;
  } catch {
    return null;
  }
}
export function savePrivateState(s: NightHirePrivateState) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PRIVATE_STATE_KEY, JSON.stringify(s));
}
export function clearPrivateState() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(PRIVATE_STATE_KEY);
}

export function newAuthorityKey(): AuthorityPrivateState {
  return { adminKey: randomBytes(32) };
}
export function newCandidateState(): CandidatePrivateState {
  return {
    secretKey: randomBytes(32),
    rating: 4n,
    completedJobs: 12n,
    credentialId: randomBytes(32),
    credentialSalt: randomBytes(32),
    salaryLower: 120_000n,
    salaryUpper: 160_000n,
    jurisdictionHash: randomBytes(32),
  };
}

// ---------------------------------------------------------------------------
// Witness implementations — passed to the Contract constructor.
//
// Each witness reads from the supplied private state. Cross-role calls
// (e.g. admin trying to fetch candidate rating) throw so the call fails
// loudly rather than silently leaking defaults.
// ---------------------------------------------------------------------------

function isCandidate(
  ps: NightHirePrivateState
): ps is { role: 'candidate'; state: CandidatePrivateState } {
  return ps.role === 'candidate';
}
function isAuthority(
  ps: NightHirePrivateState
): ps is { role: 'authority'; state: AuthorityPrivateState } {
  return ps.role === 'authority';
}

export const witnesses = {
  localAuthorityKey: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (!isAuthority(privateState)) throw new Error('localAuthorityKey requires authority role');
    return [privateState, privateState.state.adminKey];
  },
  localSecretKey: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (!isCandidate(privateState)) throw new Error('localSecretKey requires candidate role');
    return [privateState, privateState.state.secretKey];
  },
  localRating: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (!isCandidate(privateState)) throw new Error('localRating requires candidate role');
    return [privateState, privateState.state.rating];
  },
  localCompletedJobs: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (!isCandidate(privateState)) throw new Error('localCompletedJobs requires candidate role');
    return [privateState, privateState.state.completedJobs];
  },
  localCredentialId: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (!isCandidate(privateState)) throw new Error('localCredentialId requires candidate role');
    return [privateState, privateState.state.credentialId];
  },
  localCredentialSalt: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (!isCandidate(privateState)) throw new Error('localCredentialSalt requires candidate role');
    return [privateState, privateState.state.credentialSalt];
  },
  localSalaryLower: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (!isCandidate(privateState)) throw new Error('localSalaryLower requires candidate role');
    return [privateState, privateState.state.salaryLower];
  },
  localSalaryUpper: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, bigint] => {
    if (!isCandidate(privateState)) throw new Error('localSalaryUpper requires candidate role');
    return [privateState, privateState.state.salaryUpper];
  },
  localJurisdictionHash: (
    { privateState }: WitnessContext<any, NightHirePrivateState>
  ): [NightHirePrivateState, Uint8Array] => {
    if (!isCandidate(privateState)) throw new Error('localJurisdictionHash requires candidate role');
    return [privateState, privateState.state.jurisdictionHash];
  },
};

// ---------------------------------------------------------------------------
// Runtime — wraps the Contract class and gives a clean async API for the UI.
// ---------------------------------------------------------------------------

export type CircuitResult<T = unknown> = {
  readonly txId: string;        // pseudo tx-id (sha256-ish of inputs + state)
  readonly result: T;
  readonly ledger: any;
  readonly durationMs: number;
};

async function sha256Hex(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Tiny fallback (not cryptographically strong; only used to produce a
  // visible identifier for the local-session tx).
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return ('00000000' + (h >>> 0).toString(16)).slice(-8).repeat(8);
}

export class NightHireRuntime {
  private contract: any;
  private contractState: any;
  private ledgerDecoder: any;

  constructor(Contract?: any, ledgerDecoderArg?: any, initialLedgerSeed?: any) {
    this.contract = new (Contract ?? NightHireContract)(witnesses);
    this.ledgerDecoder = ledgerDecoderArg ?? ledgerDecoder;
    this.contractState = initialLedgerSeed ?? {
      authority: new Uint8Array(32),
      candidateCount: 0n,
      totalRatings: 0n,
      ratingSum: 0n,
      completedJobs: 0n,
      sequence: 0n,
      credentialAttestations: new Map(),
    };
  }

  /** Run the constructor (admin key) and produce the initial contract state. */
  async deploy(adminKey: Uint8Array, _ps: NightHirePrivateState): Promise<CircuitResult<Uint8Array>> {
    const t0 = performance.now();
    const ctx = createConstructorContext(
      { adminKey } as any,
      COIN_PUB
    );
    const initial = this.contract.initialState(ctx, adminKey);
    this.contractState = (initial as any).currentContractState;
    const t1 = performance.now();
    const txId = await sha256Hex(`deploy:${bytesToHex(adminKey)}:${Date.now()}`);
    return {
      txId,
      result: this.readAuthority(),
      ledger: this.ledger(),
      durationMs: t1 - t0,
    };
  }

  /** Invoke a non-constructor circuit and update the contract state. */
  async call<T>(
    circuitId: string,
    args: any[],
    _ps: NightHirePrivateState
  ): Promise<CircuitResult<T>> {
    const t0 = performance.now();
    const ctx = createCircuitContext(
      ADDR,
      COIN_PUB,
      this.contractState,
      _ps
    );
    const fn = this.contract.impureCircuits[circuitId].bind(this.contract.impureCircuits);
    let out: { result: T; context: CircuitContext<any> };
    try {
      out = fn(ctx, ...args);
    } catch (e) {
      throw new Error(`${circuitId}(${args.map(hexify).join(', ')}) failed: ${(e as Error).message}`);
    }
    this.contractState = (out.context as any).currentQueryContext.state;
    const t1 = performance.now();
    const txId = await sha256Hex(
      `${circuitId}:${args.map(hexify).join(',')}:${Date.now()}`
    );
    return {
      txId,
      result: out.result,
      ledger: this.ledger(),
      durationMs: t1 - t0,
    };
  }

  /** Decode the current ledger into a typed object. */
  ledger() {
    const dec: any = (this.ledgerDecoder ?? ledgerDecoder)(this.contractState);
    // Convert Map to plain Map<hex,hex> for React rendering.
    const atts: Record<string, string> = {};
    if (dec && dec.credentialAttestations && typeof dec.credentialAttestations[Symbol.iterator] === 'function') {
      for (const [k, v] of dec.credentialAttestations) {
        atts[bytesToHex(k)] = bytesToHex(v);
      }
    }
    return {
      authority: bytesToHex(dec.authority),
      candidateCount: dec.candidateCount,
      totalRatings: dec.totalRatings,
      ratingSum: dec.ratingSum,
      completedJobs: dec.completedJobs,
      sequence: dec.sequence,
      credentialAttestations: atts,
      member: (keyHex: string) => !!atts[keyHex],
    };
  }

  readAuthority(): Uint8Array {
    return (this.contractState as any).authority ?? new Uint8Array(32);
  }
}

function hexify(a: unknown): string {
  if (a instanceof Uint8Array) return bytesToHex(a);
  if (typeof a === 'bigint') return a.toString();
  if (typeof a === 'string') return a;
  return String(a);
}

export { bytesToHex, hexToBytes };
