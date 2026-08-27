# 🛡️ NightHire — Technical Deep Dive & Overview

**NightHire** is a privacy-first, zero-knowledge hiring and credential verification protocol built on the **Midnight L2 Network**. It is designed to eliminate the systemic privacy leaks in modern recruitment by replacing blind identity disclosures with cryptographic progressive disclosure.

---

## 1. The Core Structural Flaw in Modern Hiring

In traditional recruiting pipelines, the candidate is forced to undergo **immediate identity disclosure (doxxing)** before any qualification assessment occurs:
* **The Leak**: Job boards and Applicant Tracking Systems (ATS) demand full legal name, current employer, personal contact info, and salary history.
* **The Risk**: Currently-employed candidates risk retaliation from their existing employers if their job search is detected.
* **The Waste**: 90% of applicants are filtered out at the screening phase, meaning their private personal identifiable information (PII) is permanently stored in vulnerable third-party databases without any reciprocal value.

```text
Traditional Flow:
Candidate App  ──(Exposes Name, Current Company, Salary, Email)──>  ATS Database  ──(90% Rejected)──>  PII Leaked & Stored
```

---

## 2. The Solution: Zero-Knowledge Progressive Disclosure

NightHire reverses the recruitment dynamic using **Progressive Disclosure**:

```text
1. Candidate registers anonymous ZK commitment (secret key, credentials) on Midnight L2.
2. Employer posts role with cryptographic screening criteria (e.g., Rating >= 4★).
3. Candidate generates local ZK Proof of meeting criteria (Zero PII exposed).
4. Candidate submits ZK Proof Token.
5. Employer verifies ZK Proof (PASS).
6. Employer requests selective identity disclosure.
7. Candidate accepts and discloses identity.
```

1. **Stage 1 (Screening)**: Candidates prove they meet qualification bars (e.g., "I have completed at least 10 projects with an average rating of 4.5★") using zero-knowledge proofs. **No names, no emails, no employer titles are revealed.**
2. **Stage 2 (Mutual Shortlist)**: Once the employer verifies the ZK proof and confirms they want to move forward, a request for disclosure is sent.
3. **Stage 3 (Selective Disclosure)**: The candidate chooses to reveal their identity, current employer, or contact details only after mutual interest is established.

---

## 3. Cryptographic Trust Hierarchy

NightHire organizes credentials into a three-tier trust model, balancing speed, validation overhead, and cryptographic strength:

| Trust Level | Source Type | Verification Mode | Use Case Examples |
| :--- | :--- | :--- | :--- |
| **Level 1: Self-Attested** | Candidate Declaration | Local Witness Binding | Target compensation bands, preferred tech stack, availability. |
| **Level 2: Linked Accounts** | zk-TLS / OAuth | Cryptographic proof of third-party API | GitHub commit histories, LinkedIn tenure proofs (without revealing exact usernames). |
| **Level 3: Cryptographic** | Third-party Issuer | Digital Signature verification | Professional certifications (e.g., Midnight Certified Developer), university degrees. |

---

## 4. Midnight Smart Contract Architecture

The protocol is built using Midnight's **Compact** contract language, separating public ledger variables from private client witnesses.

### The Zero-Knowledge Proving Flow
When a candidate generates a proof:
1. **Witness Input**: The client's browser loads the private witness context (including `localSecretKey` and `localRating`).
2. **Constraint Enforcement**: The Compact circuit asserts that `localRating >= threshold` without disclosing `localRating`.
3. **The `disclose()` Operator**: Compact outputs only the public parameter (the threshold) and a proof token indicating the assertion passed.

```typescript
// nighthire.compact
pragma language_version >= 0.21.0;
import CompactStandardLibrary;

export ledger totalRatings: Counter;
export ledger ratingSum: Counter;
export ledger sequence: Counter;

witness localSecretKey(): Bytes<32>;
witness localRating(): Uint<16>;

export circuit proveMinRating(threshold: Uint<16>): Uint<16> {
  const myRating = localRating();
  assert(myRating >= threshold, "Rating below threshold");
  return disclose(threshold);
}
```

### Protection Against Replay Attacks
To prevent candidates from sharing or copying proof tokens across multiple applications:
* Every proof binding incorporates a **sequence counter** (`sequence`).
* The contract verifies the proof token against the current public sequence hash, increments the sequence counter upon verification, and invalidates the reuse of that specific proof signature.
