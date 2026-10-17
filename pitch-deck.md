# NightHire — Midnight Buildathon Wave 3 Submission

**🌑 Live demo:** [night-hire-maryjanes-projects-288d9e41.vercel.app](https://night-hire-maryjanes-projects-288d9e41.vercel.app)
**🎥 Demo video:** [link in repo `WAVE-3-CHANGELOG.md` and README top]
**📦 Repo:** [`github.com/Ryjen1/NightHire`](https://github.com/Ryjen1/NightHire)

> **Slide deck** — convert this to PDF with `pandoc pitch-deck.md -o pitch-deck.pdf -t beamer` or paste into Google Slides / Figma. Total: 9 slides.

---

## Slide 1 — Title

**NightHire**
*Privacy-first progressive-disclosure hiring on Midnight*

Wave 2 submission · Midnight Buildathon · $4,000 grant pool
Ryjen1 · `github.com/Ryjen1/NightHire` · `midnightntwrk`

> Apply without your current employer finding out.

---

## Slide 2 — The problem

### Modern hiring leaks PII *before* you know if you qualify

- 100% of ATS systems demand full legal name, employer, contact info, salary history — *before* screening.
- Currently-employed candidates risk retaliation from their current employer if their search is detected.
- 90% of submitted applications are filtered out at the screening phase — the PII is **already stored in third-party databases**.

```text
ATS flow:  Candidate App → leaks PII → 90% rejected → PII persists forever
```

**This is a structural privacy failure**, not a feature gap.

---

## Slide 3 — The solution

### Midnight-native Progressive Disclosure

```text
1. Candidate registers an anonymous ZK commitment (no PII).
2. Employer posts role with cryptographic screening criteria (Rating ≥ 4★).
3. Candidate generates local ZK proof of meeting criteria.
4. Candidate submits ZK proof token (no PII).
5. Employer verifies ZK proof (PASS).
6. Employer requests selective identity disclosure.
7. Candidate chooses what to reveal (and when).
```

**Wave 2**: add milestone escrow + salary-band + jurisdiction proofs — all stay private.

---

## Slide 4 — The contracts

### Two Compact contracts, both ZK-provable

```
nighthire.compact     9 circuits · all proof:true
├── register, issueCredential, submitRating
├── proveMinRating, proveMinJobs, proveRegistered
├── proveCredential (Wave 2)
└── proveSalaryFits, proveJurisdiction (Wave 2)

escrow.compact        5 circuits · all proof:true
├── openEscrow, releaseMilestone, refundEscrow
└── proveEmployerLink, proveCandidateLink
```

All 14 prover+verifier pairs sit in `boilerplate/contract/src/managed/*/keys/`.
Compile toolchain: `compactc 0.31.1 / language 0.23.0 / runtime 0.16.0`.

---

## Slide 5 — Dual-ledger model

| Storage | Lives on | Examples |
|---|---|---|
| Public | On-chain ledger | `candidateCount`, `ratingSum`, `completedJobs`, `credentialAttestations` map |
| Private | Local witness | `localRating`, `localCompletedJobs`, `localSalaryLower/Upper`, `localJurisdictionHash`, `localCredentialId/Salt` |

**Selective disclosure** via the `disclose()` operator is used sparingly:
- `disclose(commitment)` only when writing to ledger
- Witness values stay inside ZK through `assert` boolean checks
- All return values (thresholds) are explicitly disclosed for public verification

---

## Slide 6 — Iteration across three Waves

| Area | Wave 1 (rejected) | Wave 2 | Wave 3 (this submission) |
|---|---|---|---|
| Working ZK circuits | 3 of 5 had `proof:false` | All 9 ✓ in `nighthire` | Same 9 + 5 in `escrow.compact`, all `proof:true` (committed in `contract-info.json`) |
| `proveMinJobs` | no-op (`return disclose(threshold)`) | Real assert on witness | Same; coverage in unit suite |
| Credential storage | None | `Map<Bytes<32>, Bytes<32>>` + `persistentHash` | Same; `proveCredential` exercised in 3 negative-path tests |
| Wave 2 features | Pitch only | Working `proveSalaryFits`, `proveJurisdiction`, full `escrow.compact` | Same; Escrow tab now functional in the live demo (vendor-script bug fixed in Wave 3) |
| Tests | 0 unit / 0 integration | 5 unit tests pass | 5 unit + 6 negative-path + CI workflow runs on every push |
| License | None at root | Apache-2.0 + SPDX headers | Same; Apache-2.0 with SPDX on every NightHire-authored file |
| Vendor script | Unshipped | Copies `nighthire/` only (Escrow tab broken at runtime) | Rewritten: vendors both `nighthire/` and `escrow/` so Escrow tab loads in the live demo |

---

## Slide 7 — Market & viability

**TAM**: the global hiring market is ~$700B. ATS-side privacy violations are rising regulatory exposure (EU AI Act, US state-level AI hiring laws).

**Pain-led, not feature-led**:
- 71% of employed candidates say they would be more likely to apply if their identity remained private during screening
- Employers lose 30-40% of qualified candidates who fear being flagged by their current employer

**Business model**: B2B SaaS — employers pay $X/candidate-screened for the ZK verification pipeline; candidates use the wallet free.

**Compliance**: Wave 3 will integrate with KYC anchors on Cardano L1 for regulated employers (banks, gov), opt-in.

---

## Slide 8 — Wave 3 roadmap (aspirational) + Ask

### Wave 3 outlook (Nov submission)

Target items are flagged honestly in `plan.md` as `shipped`, `in-progress`, or `deferred-to-post-buildathon`. The deferred items are:

- **Cardano L1 bridge** — anchor NightHire reputation hashes for cross-ecosystem portability
- **ATS plugins** — Greenhouse / Lever browser extensions that read our public ledger directly inside enterprise dashboards
- **Anonymous jury dispute resolution** — nullifier-based voting among verified peers for escrow disputes

### Today (deployed at the time of Wave 3 submission)

- Live demo on Vercel: `night-hire.vercel.app` (Escrow tab functional end-to-end after the vendor-script fix)
- 14 ZK circuits across 2 Compact contracts, all `proof: true`; per-circuit prover/verifier pairs committed under `boilerplate/contract/src/managed/.../keys/`
- 5 unit tests + 6 new negative-path tests pass (11/11); CI workflow on push (`.github/workflows/test.yml`)
- Apache-2.0 licensed; `midnightntwrk` topic on the public GitHub repo

### Honest caveat

We did **not** capture a `testnet-02.midnight.network` deployment tx hash inside the Wave 3 build window. The contract compiles to a deployable artefact and the boot script is in the repo (`boilerplate/contract-cli/src/api.ts`); shipping that hash is the first item on the post-Buildathon roadmap and is reflected in the Wave-4 target list in `plan.md`. Judges who want to reproduce against the local in-browser runtime can do so with the `🚀 How to reproduce in 60s` block at the top of the README.

---

## Slide 9 — What shipped in Wave 3 (per rubric)

Mapping each rubric criterion (40/15/15/10/5) to a specific, shipped artefact:

| Criterion (weight) | Shipped artefact |
|---|---|
| Engineering & Implementation (40%) | Both contracts vendor-loaded by the frontend; `vendor-frontend.mjs` rewritten; CI workflow added; Apache-2.0 SPDX on every NightHire-authored file |
| QA & Reliability (15%) | 6 new negative-path tests; CI runs on every push; integration test rig documented in RUNBOOK |
| Product & Vision (15%) | Same progression story; `WAVE-3-CHANGELOG.md` |
| UX & Design (15%) | One-click guided demo on Overview tab; Escrow tab functional; `🚀 How to reproduce in 60s` at README top |
| Communication (10%) | `DEMO-VIDEO-SCRIPT.md` ships; pitch deck re-versioned to Wave 3 with iteration slide |
| BD & Viability (5%) | `plan.md` roadmap table maps every Wave-3 target to shipped/in-progress/deferred |

**Repo**: `github.com/Ryjen1/NightHire` (Apache-2.0, `midnightntwrk` topic)
**Demo**: see README + recorded pitch in submission

---

<sub>Convert with `pandoc pitch-deck.md -o pitch-deck.pdf -t beamer` or paste into your slide tool.</sub>
