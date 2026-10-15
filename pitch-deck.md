# NightHire — Midnight Buildathon Wave 2 Submission

**🌑 Live demo:** [night-hire-maryjanes-projects-288d9e41.vercel.app](https://night-hire-maryjanes-projects-288d9e41.vercel.app)

> **Slide deck** — convert this to PDF with `pandoc pitch-deck.md -o pitch-deck.pdf -t beamer` or paste into Google Slides / Figma. Total: 8 slides.

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

## Slide 6 — What changed Wave 1 → Wave 2

| Area | Wave 1 (rejected) | Wave 2 |
|---|---|---|
| Working ZK circuits | 3 of 5 had `proof:false` | All 9 ✓ |
| `proveMinJobs` | no-op (`return disclose(threshold)`) | Real assert on witness |
| Credential storage | None | `Map<Bytes<32>, Bytes<32>>` backed by persistentHash |
| Wave 2 features | Pitch only | Working `proveSalaryFits`, `proveJurisdiction`, full `escrow.compact` |
| License | None at root | Apache-2.0 + SPDX headers |

---

## Slide 7 — Market & viability

**TAM**: the global hiring market is ~$700B. ATS-side privacy violations are rising regulatory exposure (EU AI Act, US state-level AI hiring laws).

**Pain-led, not feature-led**:
- 71% of employed candidates say they would be more likely to apply if their identity remained private during screening
- Employers lose 30-40% of qualified candidates who fear being flagged by their current employer

**Business model**: B2B SaaS — employers pay $X/candidate-screened for the ZK verification pipeline; candidates use the wallet free.

**Compliance**: Wave 3 will integrate with KYC anchors on Cardano L1 for regulated employers (banks, gov), opt-in.

---

## Slide 8 — Wave 3 roadmap + Ask

### Wave 3 outlook (Nov 2 submission)

- **Cardano L1 bridge** — anchor NightHire reputation hashes for cross-ecosystem portability
- **ATS plugins** — Greenhouse / Lever browser extensions that read our public ledger directly inside enterprise dashboards
- **Anonymous jury dispute resolution** — nullifier-based voting among verified peers for escrow disputes

### Today

- Live contract on Midnight testnet
- 5/5 unit tests pass; integration suite requires Docker
- Frontend wired to real Midnight.js HTTP-proof provider

**Repo**: `github.com/Ryjen1/NightHire` (Apache-2.0, `midnightntwrk` topic)
**Demo**: see README + recorded pitch in submission

---

<sub>Convert with `pandoc pitch-deck.md -o pitch-deck.pdf -t beamer` or paste into your slide tool.</sub>
