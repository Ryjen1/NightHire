# 🛡️ NightHire — Product Plan & Multi-Wave Roadmap

**🌑 Demo:** *No live deployment. Run `npm run dev` after the Quickstart to start the frontend at http://localhost:5173/.*

## Executive Summary

**NightHire** is a privacy-first, zero-knowledge hiring and credential-verification protocol built on the **Midnight Network**. It solves the structural flaw in modern recruitment: candidates are forced to leak their full legal name, current employer, salary history, and personal contact information into arbitrary applicant tracking systems (ATS) **before** knowing if they meet the job bar.

Using Midnight's Compact smart-contract language and zero-knowledge proof system, NightHire implements **Progressive Disclosure**:

- **Phase 1 (Screening)** — Candidates prove technical qualifications, minimum job volume, salary band overlap, and verified rating scores via ZK proofs **without** revealing identity, current employer, or private history.
- **Phase 2 (Mutual Shortlist)** — When both employer and candidate express mutual interest, **selective** identity disclosure is requested and granted.
- **Phase 3 (Work + Payment, Wave 2)** — Employers lock funds in a milestone escrow contract; releases happen via ZK proof of work.

---

## 🚀 Wave 1 — MVP (not graded)

Shipped: credential & reputation smart contracts, witness providers, 3-tier trust model in UI, and a sandboxed interactive ZK simulator. Limitation: 3 of 5 advertised ZK circuits had `proof: false` in the compiled output, and the frontend mocked `setTimeout`-based "proofs" rather than invoking Midnight.js.

> **Disqualified by judges** (see Wave 2 fixes for details).

---

## 🛡️ Wave 2 — Real ZK provable circuits + Escrow (this submission)

**Goal**: fix Wave 1 deficits and add the Wave-2 features called out in the original roadmap (private escrow, salary band + jurisdiction range proofs). Every advertised ZK circuit must compile with `proof: true` and a real `.prover` / `.verifier` pair.

### 1. ZK provability pass — `nighthire.compact`

| Before (Wave 1) | After (Wave 2) |
|---|---|
| `proveMinRating` → `proof: false` (compilation silently dropped it) | `proof: true`; prover+verifier keys present |
| `proveMinJobs` → body was `return disclose(threshold)` (no-op) | Reads `localCompletedJobs` witness; asserts `>= threshold` inside ZK |
| `proveRegistered` → `proof: false` | `proof: true` |
| `register()` → discarded the `commitment` argument | Stores commitment in `credentialAttestations: Map<Bytes<32>, Bytes<32>>` |
| `proveCredential` (added in Wave 2) | Uses both `localCredentialId` + `localCredentialSalt` witnesses; verifier only learns yes/no |

**Total**: 8 user-facing circuits + 1 internal `hashAuthorityKey` helper. 100% `proof: true`.

**Compilation fix**: every circuit now does a ledger write (`sequence.increment(1)` or `Map.insert(...)`) at least once. Without a ledger-write boundary the compiler skips proof generation even when the circuit reads witnesses — we discovered this by reading the `contract-info.json` output and comparing against the Wave-1 artifact.

### 2. Private escrow contract — `escrow.compact`

5 new circuits, all provable:

- `openEscrow(employerCommitment, candidateCommitment, amount, milestoneCount)` → returns the `escrowId`. Stores escrow bookkeeping on-chain and reserves the pair so one employer can't double-fund the same candidate.
- `releaseMilestone(escrowId, milestoneAmount)` → cumulative release count is verified to stay within budget without overflow; final milestone flips state to `released-all`.
- `refundEscrow(escrowId)` → authority cancels an unspent escrow and clears the pair slot.
- `proveEmployerLink(escrowId)` → candidate ZK-proves knowledge of the employer commitment's secret (replay-protected).
- `proveCandidateLink(escrowId)` → employer ZK-proves knowledge of the candidate commitment's secret.

Ledger: 6 dedicated maps (`escrowAmount`, `escrowEmployer`, `escrowCandidate`, `escrowReleased`, `escrowMilestoneCount`, `escrowState`), plus the `activeEscrowByPair` index.

### 3. Range / overlap proofs (Wave 2 additions inside `nighthire.compact`)

- `proveSalaryFits(jobLower, jobUpper)` → both candidate bounds stay private; only `fits` / `doesn't fit` is asserted.
- `proveJurisdiction(expectedCommitment)` → candidate jurisdiction hash stays private; the employer passes a hash of the allowed jurisdiction name and the proof checks equality inside ZK.

### 4. Witness types — discriminated union

`witnesses.ts` now exports two private-state shapes:

- `AuthorityPrivateState` (single admin key held by the platform admin client)
- `CandidatePrivateState` (a candidate's secret key, rating, completedJobs, credentialId, credentialSalt, salary band, jurisdiction hash)

A discriminated union `NightHirePrivateState` lets the witness provider return the right private state for its role. The contract class is instantiated twice in tests: once with the authority key, once with the candidate state.

### 5. Tests — `nighthire.unit.test.ts`

5 unit tests that pass without Docker:

1. Contract module exposes all 9 circuits
2. All 9 witnesses declared
3. Every circuit produces a real `.prover` + `.verifier` key
4. `Contract` class is constructable
5. Ledger decoder wires through correctly

A optional `@slow` integration suite under `test/commons.ts` spins up a Midnight standalone node via Docker compose and exercises every circuit end-to-end.

### 6. Toolchain compatibility

Bumped `@midnight-ntwrk/compact-runtime` from `^0.8.1` to `0.16.0` so the compiled `index.js` calls into the runtime that produced it. Without this bump, every circuit threw `checkRuntimeVersion is not a function` at import time.

---

## Future work

### 1. Cardano L1 + Midnight L2 cross-ecosystem reputation
- State Relay Bridge: verify Midnight ZK state proofs on Cardano L1 for cross-chain reputation portability.

### 2. Enterprise ATS Integration Plugins
- Greenhouse & Lever browser extensions and API connectors allowing enterprise recruiters to post jobs with provable criteria and receive pre-verified ZK applications.

### 3. Decentralized Jury & Dispute Resolution
- Anonymous Nullifier-Based Voting among verified peers for escrow disputes.
- Zero-Knowledge Soulbound Credentials (ZK-SBCs) — non-transferable, privacy-preserving reputation tokens.

### 4. Zswap shielded-coin value movement
- The escrow contract is currently a ledger-only state machine (see "Known limitations" below). Wiring Zswap shielded-coin movement into the existing state machine is a contained change (one new circuit) without a contract redeploy.

---

## Known limitations

- **No live testnet deployment captured in this repository.** The contract suite compiles to a deployable artefact and the boot script is in `boilerplate/contract-cli/src/api.ts` (`WalletBuilder.native()` + `httpClientProofProvider`); it requires funded testnet DUST for the deploy call.
- **`boilerplate/contract-cli/` directory name is preserved** from the Midnight example scaffold (for path stability with the upstream tooling). Internally everything is NightHire-flavored; no Midnight Foundation code is shipped.
- **Zswap shielded-coin value movement is not wired** in `escrow.compact`. The escrow is a ledger-only state machine (per the in-contract honesty note `escrow.compact:104-105`).

---

<p align="center">
  <b>NightHire Protocol</b> • Built on Midnight Network
</p>
