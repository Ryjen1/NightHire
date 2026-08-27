# 🛡️ NightHire — Product Plan & Multi-Wave Roadmap

## Executive Summary
**NightHire** is a privacy-first, zero-knowledge hiring and credential verification protocol built on the **Midnight Network**. It solves the core structural flaw in modern recruitment: candidates are forced to leak their full legal name, current employer, salary history, and personal contact information to arbitrary applicant tracking systems (ATS) before even knowing if they meet the job bar.

Using Midnight's Compact smart contract language and zero-knowledge proof system, NightHire implements **Progressive Disclosure**:
- **Phase 1 (Screening)**: Candidates prove technical qualifications, minimum job volume, and verified rating scores via ZK proofs without revealing identity, current employer, or private history.
- **Phase 2 (Mutual Shortlist)**: Only when both employer and candidate express mutual interest is selective identity disclosure requested and granted.

---

## 🚀 Wave 1: Completed Implementation (Full MVP)

In Wave 1, we successfully built and verified the end-to-end protocol foundation, compact ZK circuits, build automation, and progressive disclosure user interface.

### 1. Unified Smart Contract & ZK Circuits (`nighthire.compact`)
- **Consolidated Architecture**: Merged credential registration and reputation management into a unified Midnight protocol contract.
- **Circuits Built & Verified**:
  - `register(commitment: Bytes<32>)`: Authority-assisted candidate registration storing private commitment hashes on-chain.
  - `proveRegistered(): Bytes<32>`: Autonomous zero-knowledge circuit proving candidate registration without exposing the underlying secret key.
  - `submitRating(rating: Uint<16>)`: Verified milestone rating submission (1 to 5 stars) with sequence counter incrementation for replay protection.
  - `proveMinRating(threshold: Uint<16>)`: Selective disclosure circuit asserting candidate rating $\ge$ threshold using the `disclose()` operator without revealing exact score or client identity.
  - `proveMinJobs(threshold: Uint<16>)`: Work history volume proof asserting completed milestones $\ge$ threshold without exposing company names.
- **Compiler Hardening**: Successfully compiled with Compact toolchain v0.31.1 ($k=13$, rows=4585) with zero witness-disclosure warnings.

### 2. Private Witness & Off-Chain State Provider (`witnesses.ts`)
- Implemented `WitnessContext` mapping `NightHirePrivateState` (`secretKey`, `rating`, `credentials`) to contract circuits.
- Established clean separation between local client secrets and public ledger counters (`candidateCount`, `totalRatings`, `ratingSum`, `sequence`).

### 3. Build Automation & CLI Suite (`auto-generator.js` & `contract-cli`)
- Automated detection, compilation, TypeScript binding generation, and CLI packaging for `.compact` files.
- Built multi-target deployment pipeline (`deploy.js`) supporting:
  - **Remote Midnight Testnet**: Automated deployment and state query via funded wallet seed.
  - **Local Standalone Mode**: Isolated testing via Docker Midnight nodes (`standalone.yml`).

### 4. Progressive Disclosure React Web Application (`frontend/`)
- **Pain-Led Aesthetic**: Custom "Obsidian & Neon Violet" design system built with vanilla CSS tokens, glassmorphism, and responsive layout primitives.
- **10-Second Before/After Risk Engine**: Interactive comparison exposing traditional application leak points (12 PII vectors) vs. NightHire ZK protection.
- **3-Tier Credential Trust Architecture**:
  - *Level 1 (Self-Attested)*: Candidate-declared skills and target compensation bands.
  - *Level 2 (Linked Accounts)*: Verified GitHub/LinkedIn contribution metrics.
  - *Level 3 (Cryptographic Attestations)*: Third-party issuer certificates (e.g. Midnight Certified Compact Developer).
- **Candidate Command Center**: Private secret key vault with live 4-stage ZK proof generation and celebratory telemetry.
- **Employer High-Signal Pipeline**: Provable requirement filter, zero-doxxing candidate cards, and instant on-chain proof verification.
- **Interactive ZK Circuit Playground**: Real-time Compact source viewer and prover execution sandbox.
- **On-Chain Protocol Ledger Inspector**: Live state monitor for contract variables (`candidateCount`, `totalRatings`, `sequence`, `authority`).

### 5. Media & Submission Assets (`assets/`)
- Generated high-resolution branding assets: `logo.png`, `banner.png`, and `architecture.png`.

---

## 🛡️ Wave 2: Planned Enhancements (Milestone Escrow & Automated Attestations)

The focus of Wave 2 is adding financial guarantees and expanding verifiable credential sources:

### 1. Private Milestone Escrow Contract (`escrow.compact`)
- **Time-Locked Escrow**: Employers deposit milestone funds on Midnight with conditional release rules.
- **Zero-Knowledge Milestone Acceptance**: Candidates generate ZK proof of deliverable submission without leaking raw source code or proprietary assets prior to payment.
- **Dual-Key Payment Release**: Automated fund release upon cryptographic signature matching.

### 2. Automated zk-TLS & OAuth Credential Oracles
- **GitHub Commit Oracles**: Integrate zk-TLS proofs to verify private GitHub commit activity and repository contributions without exposing repository names or code.
- **LinkedIn Tenure Verification**: Verify candidate tenure at accredited organizations using OAuth attestations.

### 3. Enhanced Selective Disclosure Proofs
- **Salary Band Range Proofs**: Prove candidate salary expectations fall within job budget (e.g., "$140k – $180k") without revealing exact target or previous pay.
- **Geographic Region Proofs**: Prove candidate resides in an allowed jurisdiction (e.g., "US / EU Remote") without leaking home address.

---

## 🌐 Wave 3: Planned Enhancements (Cardano L1 Settlement & Enterprise ATS)

The focus of Wave 3 is enterprise scalability, cross-chain liquidity, and ecosystem adoption:

### 1. Cardano L1 + Midnight L2 Dual-Ledger Settlement
- **Cross-Chain Escrow Settlement**: Settle escrow payments in native ADA or Cardano tokens while executing privacy circuits on Midnight.
- **State Relay Bridge**: Verify Midnight ZK state proofs on Cardano L1 for cross-chain reputation portability.

### 2. Enterprise ATS Integration Plugins
- **Greenhouse & Lever Extensions**: Browser extension and API connector allowing enterprise recruiters to post jobs with provable criteria and receive pre-verified ZK applications directly inside existing ATS dashboards.
- **Automated Resume Filtering**: Eliminate 99% of spam applications by automatically discarding submissions lacking valid cryptographic proofs.

### 3. Decentralized Jury & Dispute Resolution
- **Anonymous Nullifier-Based Voting**: Jury panel of verified peers votes on escrow disputes using zero-knowledge nullifiers to prevent collusion and retaliation.
- **Zero-Knowledge Soulbound Credentials (ZK-SBCs)**: Non-transferable, privacy-preserving reputation tokens that accumulate candidate credentials over time across multiple web3 protocols.

---

<p align="center">
  <b>NightHire Protocol</b> • Built on Midnight Network • Wave 1 MVP Complete
</p>
