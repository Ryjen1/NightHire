# NightHire — Wave 3 Demo Video Script

**Target length:** 2:30–3:00
**Format:** Screen recording of the live Vercel app (https://night-hire.vercel.app), narrated.
**Audience:** Midnight Buildathon judges (technical, ZK-literate).

Open the script, read each block aloud while doing the on-screen action. Total ~3 minutes.
Don't memorise — the script is short enough to read naturally.

---

## 0:00 — Cold open (5 sec)

**Narration (over logo):**

> "NightHire — apply without your current employer finding out."

## 0:05 — Frame the problem (20 sec)

Show the About screen.

> "Job hunting while employed is risky. A blind hiring process leaks your
> identity to your current company. NightHire fixes that with progressive
> disclosure on Midnight: candidates prove they meet a job's criteria using
> zero-knowledge proofs. Employers see only what they need — never the
> candidate's name, current employer, or exact salary."

## 0:25 — Stage 1: Screening (40 sec) — *the headline demo*

Switch to the **Candidate** tab. Click **"Generate rating proof"**.

> "Stage one is screening. The candidate holds a private rating
> — this is a witness value, it never leaves the proof."

Point at the **Threshold** input and the **Proof generated** banner.

> "The candidate picks a public threshold — say 4 stars — and generates a
> ZK proof that their rating is at least that. The proof circuit
> `proveMinRating` runs locally in the browser using the Midnight
> compact-runtime, no server, no identity."

Switch to the **Employer** tab. Click **"Verify proof"**.

> "The employer verifies the proof. They see one bit: 'pass' or 'fail'.
> They learn the rating is at least the threshold — nothing else."

**Hit the same flow for `proveMinJobs` and `proveSalaryFits` quickly** (montage,
~10 sec each).

> "Same flow for jobs completed, salary band overlap, jurisdiction.
> All zero-knowledge. All privacy-preserving."

## 1:35 — Stage 3: Escrow (40 sec) — *the Wave-3 upgrade*

Switch to the **Escrow** tab.

> "Stage three is the Wave-3 milestone escrow. The employer opens
> an escrow for an anonymous pair — they commit to paying `amount`
> split across `milestoneCount` releases. The state machine tracks
> open / released-all / refunded, with a monotonic counter for
> replay protection."

Click **"Open escrow"**, then **"Release milestone 1"**, **"Release milestone 2"**.

> "Each release bumps the witness-bound milestone counter and verifies
> that `released * milestoneAmount` doesn't exceed the budget.
> The final release closes the escrow."

## 2:15 — What changed in Wave 3 (20 sec)

Show the **README / Source** tab, scroll to the Wave-3 changelog.

> "What changed since Wave 2: an extra contract (`escrow.compact`)
> with five new circuits, full escrow state machine, dual-ledger
> model — public counters on chain, private state in witnesses.
> This repository is tagged `midnightntwrk`, Apache-2.0 licensed,
> 14 contracts, 14 key-pairs all compiled with `proof: true`."

## 2:35 — Close (15 sec)

Show the Vercel URL and the GitHub repo URL side-by-side.

> "Live demo: night-hire.vercel.app. Open-source:
> github.com/Ryjen1/NightHire. Judges can reproduce in 60 seconds
> with the README's quick-start. Thanks."

---

## Production notes

- **Resolution:** 1920×1080 (Vercel renders fine at this size).
- **Audio:** Built-in laptop mic is fine; record in a quiet room.
- **Tooling:** Loom (free, screen-record + webcam off), or OBS +
  DaVinci Resolve. Export as MP4 H.264.
- **Upload:** YouTube as **unlisted** (or Loom with link-only access).
- **Caption file:** export the script as `.srt` and attach — some
  judges watch muted on commute.
- **Update** README top with the video URL the moment you upload.
