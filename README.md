# 🛡️ NightHire — Privacy-Preserving Progressive Disclosure Hiring Protocol

<p align="center">
  <img src="./assets/banner.png" alt="NightHire Banner" width="100%" />
</p>

> **"Apply without your current employer finding out."**  
> Prove you meet qualifications, experience thresholds, and verified ratings using **Midnight Zero-Knowledge Circuits** — without revealing your identity, employer name, or full history until **you** choose.

---

## 🌟 Submission Overview (Midnight Buildathon Wave 1 MVP)

Traditional job applications force candidates to leak their full identity, current employer, salary history, and personal contact info into arbitrary ATS databases before knowing if they are even shortlisted.

**NightHire** introduces **Progressive Disclosure**:
1. **Screening Phase (Zero PII Disclosed)**: Candidates submit cryptographic proofs (`proveRegistered()`, `proveMinRating()`, `proveMinJobs()`) verified directly by Midnight Compact smart contracts.
2. **Shortlist Phase (Mutual Selection)**: When an employer matches candidate criteria, mutual progressive disclosure is initiated.
3. **Multi-Tier Trust Model**: Supports Self-Attested claims (Level 1), OAuth linked proofs (Level 2), and Third-Party Cryptographic Attestations (Level 3).

---

## 📐 Architecture & ZK Flow

<p align="center">
  <img src="./assets/architecture.png" alt="NightHire Architecture Flow" width="90%" />
</p>

### Smart Contract Circuits (`nighthire.compact`)
* **`register(commitment: Bytes<32>)`**: Platform authority registers candidate zero-knowledge commitments without storing personal identifiable information.
* **`proveRegistered(): Bytes<32>`**: Candidates generate autonomous zero-knowledge proof of active registration status.
* **`submitRating(rating: Uint<16>)`**: Client milestone ratings (1 to 5) are recorded on-chain with sequence replay protection.
* **`proveMinRating(threshold: Uint<16>)`**: Candidate proves rating $\ge$ threshold without exposing exact score or past client identities.
* **`proveMinJobs(threshold: Uint<16>)`**: Candidate proves work volume threshold without revealing prior company names.

---

## 📁 Repository Structure

```text
nighthire/
├── assets/                          # Submission graphics, banner, logo & diagrams
│   ├── logo.png
│   ├── banner.png
│   └── architecture.png
├── nighthire.compact                # Unified Midnight Smart Contract & Circuits
├── credential.compact               # Credential Registration Circuits
├── reputation.compact               # Reputation & Rating Circuits
├── boilerplate/                     # Midnight Contract & CLI Subsystems
│   ├── contract/src/witnesses.ts    # Off-chain witness providers (localSecretKey, localRating)
│   └── scripts/auto-generator.js    # Automated Compact v0.31.1 build & binding pipeline
├── frontend/                        # Production React + Vite + TypeScript Web App
│   ├── src/App.tsx                  # Candidate vault, employer pipeline, & ZK playground
│   └── src/index.css                # Obsidian & Neon Violet Design System
└── plan.md                          # Multi-Wave Architecture & Milestone Roadmap
```

---

## 🚀 Quickstart

### 1. Launch the Progressive Disclosure Web App
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 2. Compile Compact Contracts & Circuits
```bash
npm run dev
```
Compiles `nighthire.compact` into Zero-Knowledge Proving and Verification keys using Compact toolchain v0.31.1.

---

## 🗺️ Wave Roadmap

- [x] **Wave 1 (Full MVP Delivered)**: Privacy-preserving credential & reputation smart contracts, witness providers, pain-led UX, 3-tier trust model, and interactive ZK simulator.
- [ ] **Wave 2 (Milestone Escrow)**: Private Escrow (`escrow.compact`) with multi-sig release and GitHub OAuth commit-tree oracle proofs.
- [ ] **Wave 3 (Cross-Chain Settlement)**: Cardano L1 settlement and enterprise ATS webhooks (Greenhouse, Lever).

---

<p align="center">
  <img src="./assets/logo.png" alt="NightHire Logo" width="120" /><br/>
  <b>Built for the Midnight Buildathon</b>
</p>