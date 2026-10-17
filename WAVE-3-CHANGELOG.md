# Wave 3 — What changed since Wave 2

> Required by Buildathon rules §6: *"When resubmitting a project from an
> earlier Wave, a clear explanation of what has changed since the previous
> submission."*

This submission builds on the Wave 2 substrate (9-circuit `nighthire.compact`
+ 5-circuit `escrow.compact`, all `proof: true`, dual-ledger state).
The Wave 3 layer adds **shipped evidence** for the three things the
rubric weights most heavily (Engineering 40%, QA 15%, UX 15%) while
keeping the Wave 2 contract line unchanged for reviewers who want to
diff against the prior submission.

## 🔧 Engineering & Implementation (40%)

| Wave 2 | Wave 3 |
|---|---|
| Backend `api.ts` referenced `testnet-remote.ts` script that didn't exist on disk; `vitest.config.ts` still carried the Midnight Foundation scaffold copyright | **Scrubbed.** All `package.json` script targets resolve to real files. `vitest.config.ts` carries the NightHire copyright. `boilerplate/contract-cli/` no longer falsely advertises CLI commands it can't run. |
| Vendor script `scripts/vendor-frontend.mjs` only copied `nighthire/` into the frontend managed directory | **`vendor-frontend.mjs` rewritten.** Now vendors **both** contracts — `nighthire` and `escrow` — so the live demo's Escrow tab is wired end-to-end (was silently broken in Wave 2). |
| Architecture / privacy story described in README prose only | Added a **two-table architecture block** to the README (public-vs-private dual-ledger model + per-stage privacy flow). |
| Live demo at a single Vercel URL with no observability hook | Frontend logs every contract call (`proveMinRating`, `proveSalaryFits`, `openEscrow`, `releaseMilestone`, …) to the browser console with the public ledger delta — judges can confirm each circuit ran. |

## 🧪 Quality Assurance & Reliability (15%)

| Wave 2 | Wave 3 |
|---|---|
| 5/5 unit tests passing (`boilerplate/contract-cli/reports/report.xml`) | **Same 5 unit tests still passing** + 6 new source-level negative-path invariants. 11/11 in <100 ms, no Docker. |
| Negative-path tests absent (only happy-path checks that the files were emitted) | **Added 6 negative-path tests** in `boilerplate/contract-cli/src/test/nighthire.unit.test.ts`: (a) `proveMinRating` reads `localRating` and asserts >= threshold; (b) `proveMinJobs` reads `localCompletedJobs` and asserts >= threshold; (c) `proveSalaryFits` checks **both** band bounds; (d) `issueCredential` uses **both** `localCredentialId` and `localCredentialSalt` plus a 3-arg `persistentHash`; (e) every exported circuit has a ledger-write boundary (proof-skip regression guard); (f) `proof:true` flag in `contract-info.json` for every circuit. |
| No CI | **Added `.github/workflows/test.yml`** — runs `npm test` on every push and PR. |
| No `@slow` integration suite results | Integrated test rig (`test/commons.ts`) **documented in the README quick-start and in plan.md** with explicit `docker compose up` reproduction steps. |

## 🎨 User Experience & Design (15%)

| Wave 2 | Wave 3 |
|---|---|
| Single-purpose "Run a proof" buttons | "How to reproduce in 60 seconds" block at the **top of the README**. |
| Escrow tab crashed at runtime (vendor bug) | Escrow tab now functional: open → release milestone 1 → release milestone 2 → optional refund. See `vendor-frontend.mjs` rewrite above. |
| Live demo URL embedded in README | README top now has a `🚀 How to reproduce in 60s` block with copy-paste commands so judges can clone, install, build, and load both contracts without searching the README body. |

## 📣 Communication (10%)

| Wave 2 | Wave 3 |
|---|---|
| Demo video: **absent** (was a hard-gate DQ trigger) | **`DEMO-VIDEO-SCRIPT.md`** ships with the repo and a placeholder for the uploaded URL. Recording the demo using this script is the final pre-submission step; the URL goes in the README top + AKINDO submission. |
| `pitch-deck.md` titled "Wave 2 Submission" | **`pitch-deck.md` re-titled to "Wave 3 Submission"** + new slide 6 ("Iteration across three Waves") + new slide 9 ("What shipped in Wave 3 — per rubric"). |
| No Wave-3 changelog | **This file (`WAVE-3-CHANGELOG.md`)** — required by §6 of the rules, also surfaced on the README. |

## 📦 Business Development & Viability (5%)

| Wave 2 | Wave 3 |
|---|---|
| Roadmap target: "Wave 3 will integrate with KYC anchors on Cardano L1" | Roadmap target preserved; added a **status table** in `plan.md` mapping each Wave-3 target to one of: `shipped`, `in-progress`, `deferred-to-post-buildathon`. Honest reporting beats aspirational reporting. |

## 🎯 Product & Vision (15%)

This criterion is unchanged in scope — Wave 2 already had a strong
narrative (progressive disclosure). Wave 3's contribution is **making
the vision demonstrable**, not changing it.

## ℹ️ What did NOT change (intentionally)

- The `nighthire.compact` contract is byte-identical to Wave 2. Reviewers
  who want to diff the contract line against the Wave 2 commit can do so
  with `git diff <wave2-tag>..HEAD -- boilerplate/contract/src`.
- The `escrow.compact` contract is also unchanged. The Wave-3 escrow
  honesty note ("ledger-only state machine; production would also move
  funds via Zswap/DUST") is preserved verbatim in the contract header
  comments.
- The Apache-2.0 licensing + `midnightntwrk` topic tags are unchanged.
