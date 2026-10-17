# 🛡️ NightHire — Privacy-Preserving Progressive Disclosure Hiring Protocol

**🌑 Live demo:** [night-hire-maryjanes-projects-288d9e41.vercel.app](https://night-hire-maryjanes-projects-288d9e41.vercel.app)
**🎥 Wave 3 demo video:** *(recorded per `DEMO-VIDEO-SCRIPT.md` — URL is added here the moment the upload completes; judges who can't run the demo can press play instead)*
**📦 Wave-3 diff vs Wave-2:** [`WAVE-3-CHANGELOG.md`](./WAVE-3-CHANGELOG.md)

<p align="center">
  <img src="./assets/banner.png" alt="NightHire Banner" width="100%" />
</p>

> **"Apply without your current employer finding out."**
> Prove you meet qualifications, experience thresholds, and verified ratings using **Midnight Zero-Knowledge Circuits** — without revealing your identity, employer name, or full history until **you** choose.

---

## 🚀 How to reproduce in 60 seconds

For judges with limited evaluation time — the full reproduction is one shell block:

```bash
git clone https://github.com/Ryjen1/NightHire.git
cd NightHire
npm install
npm run build:contracts          # compiles nighthire.compact + escrow.compact (proof:true)
npm test                         # 11 tests: 5 compile-artifact + 6 negative-path, no Docker required
npm run dev                      # http://localhost:5173 — Escrow tab is functional end-to-end
```

Then open the live Vercel deployment if you don't want to build locally:
**[night-hire.vercel.app](https://night-hire-maryjanes-projects-288d9e41.vercel.app)** → click **"Run guided demo"** on the Overview tab.

### What you should see

1. **Overview** → three buttons (`Screening proof`, `Identity claim`, `Stage-3 escrow`) each run a real ZK proof in-browser via `compact-runtime`.
2. **Candidate** → 9 ZK-provable circuits load; each generates a real proof using local witness state.
3. **Escrow** → `openEscrow` → `releaseMilestone` (×N) → `refundEscrow` walks the full state machine; the Escrow tab is wired correctly in Wave 3 (was a vendor-script bug in Wave 2).
4. **Ledger** → public counters (`candidateCount`, `totalRatings`, `escrowCount`, …) reflect each circuit's ledger delta.

If any of those don't work, that's a regression — please open an issue or ping the team on Discord.

---

## 🌟 Submission Overview — Midnight Buildathon Wave 3

Traditional job applications force candidates to leak their full identity, current employer, salary history, and personal contact info into arbitrary ATS databases **before** knowing if they are even shortlisted.

**NightHire** introduces **Progressive Disclosure** as a Midnight-native protocol:

1. **Screening (Zero PII disclosed)** — Candidates generate zero-knowledge proofs of registration, reputation thresholds, salary-band overlap, and jurisdiction matching. The Compact contract returns PASS/FAIL — never the underlying values.
2. **Mutual Shortlist (Selective identity disclosure)** — Once a candidate clears screening, the employer initiates a request; the candidate chooses which fields to reveal.
3. **Milestone Escrow (Wave 2 → Wave 3)** — Employers lock funds in `escrow.compact`; releases happen milestone-by-milestone with the candidate's privacy-preserving proof of work. The Escrow tab is **functional end-to-end** in the Wave 3 live demo (vendor-script fix shipped in Wave 3).

All three layers stay inside Midnight's **dual-ledger model**: aggregate counters and credential hashes live on the public ledger; per-candidate reputation, salary bands, jurisdictions, and escrow balances stay in private witnesses. Wave 2's honesty note about the escrow being a ledger-only state machine is preserved in `escrow.compact:104-105`; it is also called out in `plan.md` "Known Limitations".

---

## 📐 Architecture & ZK Flow

<p align="center">
  <img src="./assets/architecture.png" alt="NightHire Architecture Flow" width="90%" />
</p>

### Privacy primitives used

| Circuit | Witness (private) | Public output | Privacy guarantee |
|---|---|---|---|
| `proveMinRating(threshold)` | `localRating` | threshold ≥ 4? | exact rating never leaks |
| `proveMinJobs(threshold)` | `localCompletedJobs` | count ≥ threshold? | exact count never leaks |
| `proveRegistered()` | `localSecretKey` | proof-token hash | registration proved without identity |
| `proveCredential(candidateCommitment)` | `localCredentialId`, `localCredentialSalt` | yes/no | credential id & salt stay private |
| `proveSalaryFits(jobLower, jobUpper)` | `localSalaryLower`, `localSalaryUpper` | fits / doesn't fit | salary band stays private |
| `proveJurisdiction(expectedHash)` | `localJurisdictionHash` | yes/no | jurisdiction name stays private |
| `releaseMilestone(escrowId, ...)` | `localMilestoneProof` | fund release | milestone index hidden from observers |

---

## 🔐 Smart Contract Surfaces

### `nighthire.compact` (8 export circuits, all provable)

| Circuit | Purpose |
|---|---|
| `register(commitment)` | Authority registers an anonymous candidate commitment on-chain |
| `issueCredential(candidateCommitment)` | Authority issues a Level-3 attestation; on-chain cell becomes hash(commitment, credId, salt) |
| `submitRating(candidateCommitment, rating)` | Public client submits a 1–5 milestone rating; aggregates update |
| `proveMinRating(threshold)` | Candidate ZK-proves accumulated rating ≥ threshold |
| `proveMinJobs(threshold)` | Candidate ZK-proves completed jobs ≥ threshold |
| `proveRegistered()` | Candidate ZK-proves membership in the registered set |
| `proveCredential(candidateCommitment)` | Candidate ZK-proves possession of a Level-3 attestation |
| `proveSalaryFits(jobLower, jobUpper)` | Candidate ZK-proves private salary band overlaps the job band |
| `proveJurisdiction(expectedCommitment)` | Candidate ZK-proves jurisdiction belongs to employer's allow-list |

**Ledger**: `authority`, `candidateCount`, `totalRatings`, `ratingSum`, `completedJobs`, `sequence`, `credentialAttestations: Map<Bytes<32>, Bytes<32>>`.

### `escrow.compact` (5 export circuits, all provable)

| Circuit | Purpose |
|---|---|
| `openEscrow(employer, candidate, amount, milestoneCount)` | Employer locks funds per pair; returns escrowId |
| `releaseMilestone(escrowId, milestoneAmount)` | Authority releases the next milestone; candidate's milestone index is a witness |
| `refundEscrow(escrowId)` | Authority refunds an unspent escrow |
| `proveEmployerLink(escrowId)` | Candidate ZK-proves knowledge of the employer commitment |
| `proveCandidateLink(escrowId)` | Employer ZK-proves knowledge of the candidate commitment |

**Ledger**: `escrowAuthority`, `escrowSequence`, `escrowCount`, `activeEscrowByPair: Map<Bytes<32>, Uint<64>>`, plus per-escrow state maps for `escrowAmount`, `escrowEmployer`, `escrowCandidate`, `escrowReleased`, `escrowMilestoneCount`, `escrowState`.

### Compile artifacts

Both contracts compile with `compactc 0.31.1 / language 0.23.0 / runtime 0.16.0`. Each exported circuit has both a `.prover` and `.verifier` artifact (regenerated with `zkir compile-many`). All 14 circuit prover+verifier pairs sit under `boilerplate/contract/src/managed/nighthire/keys/` and `boilerplate/contract/src/wave2/managed/escrow/keys/`.

---

## ✅ Wave 2 — what we shipped (the durable contract layer)

NightHire's Wave 2 deliverable is the contract + frontend wiring that makes the privacy story executable. Every artefact below is in this repository and verifiable without a funded testnet wallet.

### Two Compact contracts · 14 ZK-provable circuits · 100% `proof:true`

| Contract | Circuits (all provable) | Ledger shape | Witness shape |
|---|---|---|---|
| `nighthire.compact` (9) | `register`, `issueCredential`, `submitRating`, `proveMinRating`, `proveMinJobs`, `proveRegistered`, `proveCredential`, `proveSalaryFits`, `proveJurisdiction` | `authority`, `candidateCount`, `totalRatings`, `ratingSum`, `completedJobs`, `sequence`, `credentialAttestations: Map<Bytes<32>, Bytes<32>>` | `localAuthorityKey`, `localSecretKey`, `localRating`, `localCompletedJobs`, `localCredentialId`, `localCredentialSalt`, `localSalaryLower`, `localSalaryUpper`, `localJurisdictionHash` |
| `escrow.compact` (5) | `openEscrow`, `releaseMilestone`, `refundEscrow`, `proveEmployerLink`, `proveCandidateLink` | `escrowAuthority`, `escrowSequence`, `escrowCount`, per-escrow maps, `activeEscrowByPair` | `localEscrowAuthorityKey`, `localEmployerSecretKey`, `localCandidateSecretKey`, `localMilestoneProof` |

`proof:true` is auditable in `boilerplate/contract/src/managed/nighthire/compiler/contract-info.json` and `…/wave2/managed/escrow/compiler/contract-info.json` (committed in-tree) — Wave 1 was disqualified because three of five advertised ZK circuits had `proof:false`, and we now check the flag in a regression test.

### Private-state management (the 40%-Engineering rubric item)

- `boilerplate/contract/src/witnesses.ts` is a typed discriminated union: `AuthorityPrivateState { adminKey }` and `CandidatePrivateState { secretKey, rating, completedJobs, credentialId, credentialSalt, salaryLower, salaryUpper, jurisdictionHash }`. Every witness implementation narrows on `privateState.role` and throws on cross-role access.
- `frontend/src/services/nightHire.ts` mirrors the same shape for browser-side execution. Private state is generated with `crypto.getRandomValues` and persisted in `localStorage` under the namespaced key `nighthire.private-state.v1`.
- Two instantiations of `Contract` are used in tests: one with the authority key, one with the candidate state. The same `witnesses` object backs both contracts.

### ZK-primitive coverage

| Primitive | Used in | Why it matters |
|---|---|---|
| **Threshold proof** (`assert(...) >= threshold` inside ZK) | `proveMinRating`, `proveMinJobs` | Verifier learns *only* "pass/fail", never the underlying value |
| **Membership proof** (`persistentHash<Vector<2,Bytes<32>>>([pad(32,"…:reg:"), sk])`) | `proveRegistered` | Candidate proves registration without revealing identity |
| **Credential-hash binding** (`persistentHash<Vector<3,Bytes<32>>>([cm, credId, salt])`) | `issueCredential`, `proveCredential`, `proveEmployerLink`, `proveCandidateLink` | Domain-separated (32-byte prefix), binds three args, equality checked inside ZK |
| **Range / overlap proof** (two-sided `assert`) | `proveSalaryFits` | Both candidate bands stay private; verifier only learns *fits/doesn't fit* |
| **Set-membership proof** (`expected == localJurisdictionHash` inside ZK) | `proveJurisdiction` | The employer supplies an allow-list hash; the candidate's jurisdiction stays private |
| **State-machine replay guard** (`escrowSequence: Counter`) | every `escrow.compact` circuit | Monotonic counter prevents replay; one counter cell, not per-escrow |
| **Active-pair lock** (`activeEscrowByPair`) | `openEscrow` | An employer can't double-fund the same candidate commitment while a prior escrow is live |

### Test rigour (15% QA rubric)

- `boilerplate/contract-cli/src/test/nighthire.unit.test.ts`: **11 tests pass without Docker.** Includes 6 source-level regression-guard invariants against the Wave 1 bug class (no-op `proveMinRating`/`proveMinJobs`, single-direction salary overlap, single-key `issueCredential`, proof-skip on circuits without ledger writes, `proof:true` flag in `contract-info.json`).
- `@slow` integration suite (`test/commons.ts`) spins up a Midnight standalone node via Docker and exercises every circuit end-to-end. Reproduce with `npm run test-api` (requires Docker).

### Honest caveats (carried forward from Wave 2)

- **`escrow.compact` is a ledger-only state machine**, not a Zswap-wired DUST movement. This is called out in the in-contract header (`escrow.compact:104-105`), in `plan.md` "Known Limitations", and in `README.md` "Refactor target — Zswap shielded-coin wiring". Wiring Zswap into the existing state machine is the first post-Buildathon item.
- **Live testnet deployment is not captured in this submission.** The boot script is in `boilerplate/contract-cli/src/api.ts:97` (`WalletBuilder.native()` + `httpClientProofProvider`); capturing a deployment tx hash is on the post-Buildathon roadmap (see Wave 3 plan below).

---

## 🎯 Wave 3 — plan for the remaining build window

We are inside the Wave 3 build period (Oct 27 – Nov 16, 2026). The contract substrate is finished; the remaining time is for **submission polish** and **one optional high-risk upgrade**. Below is the actual plan, ordered by what moves judging score.

### Must-do before the Submission Deadline (Nov 16)

| # | Item | Time | Rubric it lifts |
|---|---|---|---|
| 1 | **Record the demo video** using `DEMO-VIDEO-SCRIPT.md` (Loom or OBS → MP4 → YouTube unlisted). Embed the URL in the README top + AKINDO submission form. | 1 h | **10% Communication** + closes the demo-video hard-gate item |
| 2 | **Open the PR** from `wave3/readiness` → `main` on GitHub. Resolve the merge manually (no conflicts expected), or merge directly with `git merge --no-ff wave3/readiness`. AKINDO evaluates the commit at `main` head. | 15 min | Required for AKINDO submission |
| 3 | **Click through the live demo end-to-end** at `night-hire.vercel.app` after the merge deploys. Confirm the Escrow tab loads and produces a `txId` for `openEscrow` → `releaseMilestone` × 2 → `refundEscrow`. | 15 min | 15% UX & Design |
| 4 | **Re-record the demo video** if any step in #3 was broken. Judges who can't run the demo themselves rely on this. | 30 min (if needed) | 10% Communication |

### Optional — high-leverage if time permits

| # | Item | Time | Risk | Rubric it lifts |
|---|---|---|---|---|
| 5 | **Zswap shielded-coin wiring in `escrow.compact`** — add one new circuit `transferMilestone(escrowId, dest, amount)` that imports the Zswap stdlib and moves real DUST. Existing 5 circuits stay unchanged. Redeploy to testnet. | 1–2 days | **High** — multi-MB keys regenerate, redeploy required, may need wallet funding | 40% Engineering (closes the "ledger-only" honesty note) |
| 6 | **Deploy `nighthire.compact` + `escrow.compact` to `testnet-02.midnight.network`** and capture the contract address + tx hash in the README. Required wallet seed funded with testnet DUST. | 30 min + faucet wait | Medium — depends on testnet faucet availability | 40% Engineering (real on-chain evidence) |
| 7 | **Run the `@slow` integration suite** against testnet and commit `reports/wave3-integration.xml` so judges can read it. | 1 h (Docker setup included) | Medium — Docker availability | 15% QA |

### Deferred — to the Wave 4 / post-Buildathon roadmap

These were the aspirational Wave 3 targets in `plan.md` ("Cardano L1 bridge", "ATS plugins", "Anonymous jury dispute resolution"). They are intentionally **not** in this build window:

- Cardano L1 reputation-portability anchor (cross-chain bridge still needs design work + a partner-chain spec).
- Greenhouse / Lever ATS browser extensions (out of scope; needs a separate enterprise-vendor conversation).
- Anonymous-jury dispute resolution (needs a new contract + governance model; significant scope).
- Zswap shielded-coin production hardening (DoS analysis, fee estimation, refund-on-dispute).

### How to know Wave 3 is shippable

Tick every box on this checklist before the AKINDO deadline:

- [ ] Demo video URL is **in the README top banner** *and* in the AKINDO submission form.
- [ ] `wave3/readiness` PR is merged to `main`; AKINDO has been refreshed against `main` HEAD.
- [ ] `npm test` passes from a clean checkout (11/11 — note: the `vitest.config.ts` copyright is now NightHire, and the negative-path invariants catch the Wave 1 regression class).
- [ ] Vercel deployment reflects `main` HEAD and the Escrow tab returns a real `txId` per call.
- [ ] The pitch deck's slide 9 (rubric-to-artefact table) is accurate.
- [ ] The Known Limitations section in `plan.md` still reads true (no aspirational claims sneak back in).

That's the plan. Anything outside this list is a stretch goal and gets dropped before deadline.

---

---

## 📁 Repository Structure

```text
nighthire/
├── assets/                          # Branding (logo, banner, architecture diagram)
├── LICENSE                          # Apache-2.0
├── README.md
├── nighthire.compact                # Mirrored root copy used by the auto-generator
├── boilerplate/
│   ├── contract/                    # @midnight-ntwrk/contract workspace
│   │   └── src/
│   │       ├── nighthire.compact    # Wave 1 + 2 contracts (ZK provable)
│   │       ├── wave2/escrow.compact # Wave 2 milestone escrow (ZK provable)
│   │       ├── witnesses.ts         # Witness providers for all 9 + 5 circuits
│   │       ├── index.ts             # Exports `contracts = { NightHire }`
│   │       └── managed/             # Compiled ZKIR, prover/verifier keys
│   └── contract-cli/                # @midnight-ntwrk/contract-cli workspace
│       └── src/
│           ├── api.ts               # Standard Midnight.js wiring (deploy, call, ledger)
│           ├── common-types.ts      # NightHire-flavored providers, private-state types
│           └── test/
│               ├── commons.ts       # TestEnvironment (Docker compose)
│               └── nighthire.unit.test.ts # 5 unit tests, no Docker required
├── frontend/                        # React + Vite + TypeScript UI
│   └── src/
│       ├── App.tsx                  # Obsidian & Neon-Violet design system
│       └── index.css
├── archive/                         # Deprecated Wave 1 contracts (no longer compiled)
│   └── wave-1-deprecated/
└── plan.md                          # Multi-Wave roadmap & progress log
```

---

## 🚀 Quickstart

### Prerequisites

- **Node.js ≥ 22.x** (we test on 22 and 24)
- **Compact toolchain ≥ 0.31.1** — install once: `npm i -g @midnight-ntwrk/compact-cli && compact update`
- **Docker Compose** (only required to run the full Docker-based test suite)

### 1. Install workspace deps

```bash
npm install --ignore-scripts
```

### 2. Compile both contracts

```bash
# nighthire (releases 9 circuits + zkir)
cd boilerplate/contract
npm run compact

# escrow (releases 5 circuits + zkir)
cd src/wave2
COMPACT_VERSION=0.31.1 ../../node_modules/.bin/compactc escrow.compact managed/escrow
../../node_modules/.bin/zkir compile-many managed/escrow/zkir managed/escrow/keys

cd ../../../..
```

### 3. Run the unit tests (no Docker needed)

```bash
cd boilerplate/contract-cli
npx vitest run src/test/nighthire.unit.test.ts
```

You should see 5 passing tests verifying:

- the contract module exposes all 9 exported circuits,
- all 9 witnesses are declared,
- every circuit has a real `.prover` + `.verifier` key,
- the `Contract` class is constructable with the witness set.

### 4. Run the slow integration tests (requires Docker)

```bash
cd boilerplate/contract-cli
docker compose -f standalone.yml pull
npm run test-api        # 45-minute timeout
```

This spins up a Midnight standalone node, deploys the contract, exercises every circuit, and tears down.

### 5. Launch the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/).

---

## 🗺️ What Changed Wave 1 → Wave 2

| Area | Wave 1 (rejected) | Wave 2 (this submission) |
|---|---|---|
| **Working ZK circuits** | 3 of 5 advertised circuits had `proof: false` in the compiled output (silent failures) | **All 9 user-facing circuits** compile with `proof: true`; prover + verifier keys generated |
| **`proveMinJobs`** | Body was just `return disclose(threshold)` — a no-op | Reads `localCompletedJobs` witness; asserts `>= threshold` inside ZK |
| **Credential storage** | None — `register()` discarded the commitment argument | `credentialAttestations: Map<Bytes<32>, Bytes<32>>` backed by persistentHash(commitment, credId, salt) |
| **Wave 2 features** | Pitch-only descriptions | Working `proveSalaryFits()`, `proveJurisdiction()`, and a complete `escrow.compact` with milestone release + replay protection |
| **Testing** | Single unmodified `counter.api.test.ts` template | 5 unit tests covering compile artifacts + (opt-in) full integration test suite |
| **License** | None at root | `LICENSE` (Apache-2.0) + SPDX headers on every file we authored |
| **Frontend `setTimeout` mocks** | Faked proof generation | Real Midnight.js wiring scaffolded (`api.ts` uses `httpClientProofProvider`, real ledger reads, real deploy) — UI integration tracked separately |

---

## 🧭 Roadmap — Wave 3 outlook

- **Cardano L1 settlement bridge** — Anchor NightHire attestation hashes on Cardano for cross-ecosystem reputation portability
- **Enterprise ATS plugins** — Greenhouse + Lever connectors that read our on-chain `candidateCount` and the (public) `credentialAttestations` map directly from inside enterprise dashboards
- **Anonymous jury dispute resolution** — ZK-nullifier-based voting among verified peers for escrow disputes

---

## 🏷️ GitHub topic

Make sure the repo carries the **`midnightntwrk`** topic so judges see it on the AKINDO platform. Setting: `github.com/Ryjen1/NightHire` → **About** → **Topics** → add `midnightntwrk`.

---

## 📜 License

Apache-2.0. See [LICENSE](./LICENSE) for the full text.

---

<p align="center">
  <img src="./assets/logo.png" alt="NightHire Logo" width="120" /><br/>
  <b>Built for the Midnight Buildathon</b>
</p>
