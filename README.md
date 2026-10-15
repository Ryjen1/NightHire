# 🛡️ NightHire — Privacy-Preserving Progressive Disclosure Hiring Protocol

**🌑 Live demo:** [night-hire-maryjanes-projects-288d9e41.vercel.app](https://night-hire-maryjanes-projects-288d9e41.vercel.app)

<p align="center">
  <img src="./assets/banner.png" alt="NightHire Banner" width="100%" />
</p>

> **"Apply without your current employer finding out."**
> Prove you meet qualifications, experience thresholds, and verified ratings using **Midnight Zero-Knowledge Circuits** — without revealing your identity, employer name, or full history until **you** choose.

---

## 🌟 Submission Overview — Midnight Buildathon Wave 2

Traditional job applications force candidates to leak their full identity, current employer, salary history, and personal contact info into arbitrary ATS databases **before** knowing if they are even shortlisted.

**NightHire** introduces **Progressive Disclosure** as a Midnight-native protocol:

1. **Screening (Zero PII disclosed)** — Candidates generate zero-knowledge proofs of registration, reputation thresholds, salary-band overlap, and jurisdiction matching. The Compact contract returns PASS/FAIL — never the underlying values.
2. **Mutual Shortlist (Selective identity disclosure)** — Once a candidate clears screening, the employer initiates a request; the candidate chooses which fields to reveal.
3. **Milestone Escrow (Wave 2)** — Employers lock funds in `escrow.compact`; releases happen milestone-by-milestone with the candidate's privacy-preserving proof of work.

All three layers stay inside Midnight's **dual-ledger model**: aggregate counters and credential hashes live on the public ledger; per-candidate reputation, salary bands, jurisdictions, and escrow balances stay in private witnesses.

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

Both contracts compile with `compactc 0.31.1 / language 0.23.0 / runtime 0.16.0`. Each exported circuit has both a `.prover` and `.verifier` artifact (regenerated with `zkir compile-many`). All 13 circuit prover+verifier pairs sit under `boilerplate/contract/src/managed/nighthire/keys/` and `boilerplate/contract/src/wave2/managed/escrow/keys/`.

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
