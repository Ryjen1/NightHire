# NightHire — Privacy-Preserving Progressive Disclosure Hiring Protocol

**🌑 Demo:** *Local-only build. See README → Quickstart to launch at http://localhost:5173/.*

> **Slide deck** — convert this to PDF with `pandoc pitch-deck.md -o pitch-deck.pdf -t beamer` or paste into Google Slides / Figma. Total: 8 slides.

---

## Slide 1 — Title

**NightHire**
*Privacy-first progressive-disclosure hiring on Midnight*

Apply without your current employer finding out.

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
├── proveCredential (Level-3 attestation)
└── proveSalaryFits, proveJurisdiction (range / set-membership proofs)

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

## Slide 6 — Engineered against a known regression class

| Area | Bug class guarded against |
|---|---|
| Working ZK circuits | Every circuit produces a real `.prover` + `.verifier` pair (`proof:true` enforced by a regression test against `contract-info.json`). |
| `proveMinJobs` | Reads `localCompletedJobs` witness; asserts `>= threshold` inside ZK. Assert is a regression-guarded invariant. |
| Credential storage | `Map<Bytes<32>, Bytes<32>>` backed by `persistentHash(commitment, credId, salt)`; both `credId` and `salt` witnesses are required. |
| `proveSalaryFits` | Asserts **both** candidate band bounds (avoids degenerate `[0, MAX]` bands). |
| License | Apache-2.0 + SPDX headers on every NightHire-authored file. |

---

## Slide 7 — Market & viability

**TAM**: the global hiring market is ~$700B. ATS-side privacy violations are rising regulatory exposure (EU AI Act, US state-level AI hiring laws).

**Pain-led, not feature-led**:
- 71% of employed candidates say they would be more likely to apply if their identity remained private during screening
- Employers lose 30-40% of qualified candidates who fear being flagged by their current employer

**Business model**: B2B SaaS — employers pay $X/candidate-screened for the ZK verification pipeline; candidates use the wallet free.

**Compliance**: Wave 3 will integrate with KYC anchors on Cardano L1 for regulated employers (banks, gov), opt-in.

---

## Slide 8 — Roadmap (open-source direction)

Direction items the team has *not* shipped — kept here so the roadmap is honest:

- **Cardano L1 bridge** — anchor NightHire attestation hashes on Cardano for cross-ecosystem reputation portability.
- **Enterprise ATS plugins** — Greenhouse + Lever connectors that read our on-chain `candidateCount` and the (public) `credentialAttestations` map directly from inside enterprise dashboards.
- **Anonymous jury dispute resolution** — ZK-nullifier-based voting among verified peers for escrow disputes.

### Today

- Local-only demo: run `npm run dev` and open http://localhost:5173/ (Overview, Candidate, Authority, Employer, Escrow, Ledger, Source tabs all functional end-to-end)
- 14 ZK circuits across 2 Compact contracts, all `proof:true`; per-circuit prover/verifier pairs committed under `boilerplate/contract/src/managed/.../keys/`
- 11 tests pass with no Docker; CI runs on every push (`.github/workflows/test.yml`)
- Apache-2.0 licensed

**Repo**: `github.com/Ryjen1/NightHire`

---

<sub>Convert with `pandoc pitch-deck.md -o pitch-deck.pdf -t beamer` or paste into your slide tool.</sub>
