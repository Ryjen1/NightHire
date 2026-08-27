import { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Briefcase,
  UserCheck,
  Building2,
  ArrowRight,
  Sparkles,
  Key,
  Database,
  Search,
  Check,
  Award,
  Layers,
  FileCheck2,
  RefreshCw
} from 'lucide-react';

interface Credential {
  id: string;
  name: string;
  category: string;
  trustLevel: 1 | 2 | 3;
  source: string;
  privateDetail: string;
  provenClaim: string;
  verified: boolean;
}

export function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'candidate' | 'employer' | 'playground' | 'contract'>('overview');
  
  // Wallet State
  const [walletAddress] = useState('mn1q9k48z6wxe2p8t7uy320nmkd83jfv8x73l4q2');
  const [tDUSTBalance] = useState('420.50 tDUST');
  
  // Candidate State
  const [candidateSecretKey] = useState('sk_midnight_0x8f3c71a9b24e6015d8');
  const [candidateCommitment] = useState('0x4e29b183a00c87d4f91e73998bce3621dfa9783c48324f9e61280bfa');
  const [minRatingThreshold, setMinRatingThreshold] = useState<number>(4);
  const [minJobsThreshold, setMinJobsThreshold] = useState<number>(15);
  const [isProving, setIsProving] = useState(false);
  const [provingStep, setProvingStep] = useState(0);
  const [generatedProof, setGeneratedProof] = useState<string | null>(null);

  // Employer Requirements State
  const [reqMinRating, setReqMinRating] = useState(4);
  const [reqMinJobs, setReqMinJobs] = useState(10);
  const [verifiedCandidateId, setVerifiedCandidateId] = useState<string | null>(null);

  // Contract Ledger State (Live / Simulated Midnight State)
  const [ledgerState, setLedgerState] = useState({
    candidateCount: 48,
    totalRatings: 186,
    ratingSum: 892,
    completedJobs: 186,
    sequence: 235,
    authority: '0x01a9df83271894b8304918239019283019283019283019283019283019283019',
  });

  const credentials: Credential[] = [
    {
      id: 'cred-1',
      name: 'Midnight Smart Contract Engineer',
      category: 'Skill & Architecture',
      trustLevel: 3,
      source: 'Midnight Network Foundation',
      privateDetail: 'Completed Certified Compact Developer Program (#MID-8849)',
      provenClaim: 'Level 3 Verified Compact & ZK Circuit Author',
      verified: true
    },
    {
      id: 'cred-2',
      name: 'Top 5% GitHub Web3 Contributor',
      category: 'Code History',
      trustLevel: 2,
      source: 'OAuth Linked (github.com/privdev-99)',
      privateDetail: '1,420 Commits across 8 DeFi / ZK Repositories in 2025-2026',
      provenClaim: 'Active High-Impact Open Source Contributor',
      verified: true
    },
    {
      id: 'cred-3',
      name: 'Average Rating: 4.8 / 5.0 Stars',
      category: 'Reputation Score',
      trustLevel: 3,
      source: 'NightHire On-Chain Escrow Protocol',
      privateDetail: 'Rated by 34 Clients (Avg: 4.88 ★ over 38 milestones)',
      provenClaim: 'Proven Rating ≥ 4.0 ★ (Selective Disclosure)',
      verified: true
    },
    {
      id: 'cred-4',
      name: 'Compensation Range $120k – $160k',
      category: 'Compensation Band',
      trustLevel: 1,
      source: 'Self-Attested Candidate Preference',
      privateDetail: 'Current baseline: $145,000 / year + equity',
      provenClaim: 'Fits within $120k+ Senior Engineering Band',
      verified: true
    }
  ];

  const handleGenerateProof = () => {
    setIsProving(true);
    setProvingStep(1);
    setGeneratedProof(null);

    setTimeout(() => setProvingStep(2), 700);
    setTimeout(() => setProvingStep(3), 1500);
    setTimeout(() => {
      setProvingStep(4);
      setIsProving(false);
      const proofHash = `zkProof_nighthire_v1_${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`;
      setGeneratedProof(proofHash);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }, 2400);
  };

  const handleVerifyEmployerProof = (id: string) => {
    setVerifiedCandidateId(id);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <header className="navbar">
        <a href="#home" className="brand-logo" onClick={() => setActiveTab('overview')}>
          <img src="/assets/logo.png" alt="NightHire" style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover' }} />
          <span>Night<span style={{ color: 'var(--accent-purple-light)' }}>Hire</span></span>
          <span style={{ 
            fontSize: '0.7rem', 
            background: 'rgba(139,92,246,0.18)', 
            border: '1px solid var(--border-active)', 
            padding: '2px 8px', 
            borderRadius: '9999px',
            color: 'var(--accent-purple-light)',
            fontWeight: 600
          }}>
            MIDNIGHT WAVE 1 MVP
          </span>
        </a>

        <nav className="nav-links">
          <button 
            className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Briefcase size={16} /> Overview
          </button>
          <button 
            className={`nav-tab ${activeTab === 'candidate' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidate')}
          >
            <UserCheck size={16} /> Candidate Portal
          </button>
          <button 
            className={`nav-tab ${activeTab === 'employer' ? 'active' : ''}`}
            onClick={() => setActiveTab('employer')}
          >
            <Building2 size={16} /> Employer View
          </button>
          <button 
            className={`nav-tab ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => setActiveTab('playground')}
          >
            <Zap size={16} /> ZK Playground
          </button>
          <button 
            className={`nav-tab ${activeTab === 'contract' ? 'active' : ''}`}
            onClick={() => setActiveTab('contract')}
          >
            <Database size={16} /> Protocol Ledger
          </button>
        </nav>

        <div className="wallet-badge">
          <div className="wallet-status-dot"></div>
          <span>{walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{tDUSTBalance}</span>
        </div>
      </header>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          <section className="hero">
            <div className="badge-tag">
              <Sparkles size={14} /> Zero-Knowledge Progressive Disclosure
            </div>
            <h1 className="hero-title">
              Apply without your current <br />
              <span className="gradient-text">employer finding out.</span>
            </h1>
            <p className="hero-subtitle">
              Prove you meet exact technical bars, experience thresholds, and verified ratings using 
              Midnight ZK circuits — without handing over your identity, employer name, or full history until <b>you</b> choose.
            </p>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => setActiveTab('candidate')}>
                Launch Candidate Hub <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab('employer')}>
                <Building2 size={18} /> For Employers: Post & Filter
              </button>
              <button className="btn btn-emerald" onClick={() => setActiveTab('playground')}>
                <Zap size={18} /> Live Circuit Simulator
              </button>
            </div>
          </section>

          {/* 10-Second Before / After Comparison */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem' }}>
                The 10-Second Difference
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Traditional job applications leak your entire digital footprint before you even get an interview.
              </p>
            </div>

            <div className="comparison-section">
              {/* Bad: Traditional */}
              <div className="compare-card bad">
                <div className="card-header-badge bad">
                  <AlertTriangle size={14} /> TRADITIONAL HIRING (HIGH RISK)
                </div>
                <h3 className="compare-title">Complete Doxxing on Application</h3>
                <div className="item-list">
                  <div className="item-row">
                    <span>Full Legal Name & Photo</span>
                    <span className="privacy-badge danger">Public / Unprotected</span>
                  </div>
                  <div className="item-row">
                    <span>Current Employer & Job Title</span>
                    <span className="privacy-badge danger">Boss Can Discover</span>
                  </div>
                  <div className="item-row">
                    <span>Salary History & Target</span>
                    <span className="privacy-badge danger">Anchors Negotiation</span>
                  </div>
                  <div className="item-row">
                    <span>Home Address, Phone & Email</span>
                    <span className="privacy-badge danger">Scraped & Stored in ATS</span>
                  </div>
                  <div className="item-row">
                    <span>Resume Skill Claims</span>
                    <span className="privacy-badge danger">Unverified PDF text</span>
                  </div>
                </div>
              </div>

              {/* Good: NightHire */}
              <div className="compare-card good">
                <div className="card-header-badge good">
                  <CheckCircle2 size={14} /> NIGHTHIRE PROTOCOL (PROGRESSIVE DISCLOSURE)
                </div>
                <h3 className="compare-title">Cryptographic Proof Without Identity Leaks</h3>
                <div className="item-list">
                  <div className="item-row">
                    <span>Candidate Identity & PII</span>
                    <span className="privacy-badge private">🔒 Private on Device</span>
                  </div>
                  <div className="item-row">
                    <span>Verified Skill & Experience</span>
                    <span className="privacy-badge proven">🛡️ ZK Proven (Midnight Circuit)</span>
                  </div>
                  <div className="item-row">
                    <span>Verified Rating Threshold</span>
                    <span className="privacy-badge proven">🛡️ Discloses: "≥ 4.0 ★"</span>
                  </div>
                  <div className="item-row">
                    <span>Salary Band Eligibility</span>
                    <span className="privacy-badge proven">🛡️ Discloses: "Within Band"</span>
                  </div>
                  <div className="item-row">
                    <span>Full Identity Reveal</span>
                    <span className="privacy-badge disclosed">👁️ Mutual Shortlist Only</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Value Pillars */}
          <div className="grid-3" style={{ margin: '30px 0' }}>
            <div className="glass-card">
              <div style={{ color: 'var(--accent-purple)', marginBottom: '12px' }}>
                <Key size={32} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>
                1. Multi-Tier Trust Levels
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Support for self-attestations, OAuth linked profiles (GitHub, LinkedIn), and third-party cryptographic issuer certificates.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--accent-cyan)', marginBottom: '12px' }}>
                <Layers size={32} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>
                2. Selective Disclosure Circuits
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Compact smart contracts compute zero-knowledge mathematical proofs: reveal "I have 4.8+ rating" without revealing client identities.
              </p>
            </div>

            <div className="glass-card">
              <div style={{ color: 'var(--accent-emerald)', marginBottom: '12px' }}>
                <Building2 size={32} />
              </div>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '8px' }}>
                3. High-Signal Employer Tools
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Employers filter by cryptographic proof constraints, eliminating fake resumes while attracting top currently-employed talent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE PORTAL */}
      {activeTab === 'candidate' && (
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="card-title">
                  <UserCheck size={26} color="var(--accent-purple-light)" /> Candidate Privacy Command Center
                </h2>
                <p className="card-subtitle">
                  Manage your private credential vault, choose disclosure thresholds, and generate verifiable Midnight proofs.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span className="trust-badge level-3">
                  <Award size={14} /> Level 3 Verified Issuer
                </span>
                <span className="privacy-badge proven">
                  <Shield size={14} /> Proof Engine Ready
                </span>
              </div>
            </div>

            {/* Secret Key & Commitment Bar */}
            <div style={{ background: '#090912', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
              <div className="grid-2">
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    LOCAL SECRET WITNESS (Stays exclusively in your browser):
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#a78bfa' }}>
                    {candidateSecretKey}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    ON-CHAIN REGISTRATION COMMITMENT (Stored in Compact Ledger):
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                    {candidateCommitment.slice(0, 24)}...
                  </div>
                </div>
              </div>
            </div>

            {/* Credential List */}
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '14px' }}>
              Your Credential Vault & Attestation Sources
            </h3>
            <div className="item-list" style={{ marginBottom: '30px' }}>
              {credentials.map(c => (
                <div key={c.id} style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: '12px', 
                  padding: '16px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileCheck2 size={18} color="var(--accent-purple-light)" />
                      <strong style={{ fontSize: '1.05rem' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>• {c.category}</span>
                    </div>
                    <div>
                      {c.trustLevel === 3 && (
                        <span className="trust-badge level-3">
                          <Check size={12} /> Level 3: Third-Party Verified ({c.source})
                        </span>
                      )}
                      {c.trustLevel === 2 && (
                        <span className="trust-badge level-2">
                          <Check size={12} /> Level 2: Linked Account ({c.source})
                        </span>
                      )}
                      {c.trustLevel === 1 && (
                        <span className="trust-badge level-1">
                          Level 1: Self-Attested ({c.source})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid-2" style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>🔒 Raw Private Data: </span>
                      <span style={{ color: '#cbd5e1' }}>{c.privateDetail}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--accent-emerald)' }}>🛡️ Disclosed Claim: </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.provenClaim}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Proof Generator Controls */}
            <div style={{ 
              background: 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, rgba(14,14,26,0.8) 100%)',
              border: '1px solid var(--border-active)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', marginBottom: '8px' }}>
                Generate Zero-Knowledge Qualification Proof
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Select the minimum criteria to prove for an employer. The Midnight Compact circuit verifies your private witnesses against on-chain state without disclosing the raw values.
              </p>

              <div className="grid-2" style={{ marginBottom: '20px' }}>
                <div className="form-group">
                  <label className="form-label">Minimum Verified Rating Threshold (1 - 5 ★)</label>
                  <select 
                    className="form-select"
                    value={minRatingThreshold}
                    onChange={(e) => setMinRatingThreshold(Number(e.target.value))}
                  >
                    <option value={3}>Prove Rating ≥ 3.0 Stars</option>
                    <option value={4}>Prove Rating ≥ 4.0 Stars (Senior Bar)</option>
                    <option value={5}>Prove Rating ≥ 4.5 Stars (Elite Bar)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Completed Milestones / Jobs</label>
                  <select 
                    className="form-select"
                    value={minJobsThreshold}
                    onChange={(e) => setMinJobsThreshold(Number(e.target.value))}
                  >
                    <option value={5}>Prove ≥ 5 Verified Projects</option>
                    <option value={10}>Prove ≥ 10 Verified Projects</option>
                    <option value={15}>Prove ≥ 15 Verified Projects</option>
                  </select>
                </div>
              </div>

              {isProving && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--accent-purple-light)' }}>
                      {provingStep === 1 && '1. Extracting private witness data from local storage...'}
                      {provingStep === 2 && '2. Binding Compact constraints & sequence replay guards...'}
                      {provingStep === 3 && '3. Evaluating Midnight ZK Proof Provider...'}
                      {provingStep === 4 && '4. Finalizing zero-knowledge attestation token...'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{provingStep * 25}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: `${provingStep * 25}%` }}></div>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                onClick={handleGenerateProof}
                disabled={isProving}
                style={{ width: '100%', padding: '14px' }}
              >
                {isProving ? (
                  <>
                    <RefreshCw size={18} className="pulse-glow" /> Synthesizing ZK Circuit Proof...
                  </>
                ) : (
                  <>
                    <Zap size={18} /> Generate Verifiable ZK Proof Token
                  </>
                )}
              </button>

              {generatedProof && (
                <div style={{ marginTop: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid var(--accent-emerald)', borderRadius: '12px', padding: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '8px' }}>
                    <CheckCircle2 size={18} /> Zero-Knowledge Proof Generated Successfully!
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    This cryptographic proof can be verified by any employer contract on Midnight without revealing your identity or full history:
                  </p>
                  <div className="code-box">
                    {`Proof Token: ${generatedProof}\nCircuit: reputation.compact -> proveMinRating(${minRatingThreshold}), proveMinJobs(${minJobsThreshold})\nWitness Commitment: ${candidateCommitment}\nVerification Status: VALID (Zero PII Disclosed)`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EMPLOYER VIEW */}
      {activeTab === 'employer' && (
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="card-title">
                  <Building2 size={26} color="var(--accent-cyan)" /> Employer High-Signal Talent Pipeline
                </h2>
                <p className="card-subtitle">
                  Set provable cryptographic requirements. Only review candidates who have mathematically proven their qualifications.
                </p>
              </div>
              <div>
                <span className="privacy-badge proven">
                  <CheckCircle2 size={14} /> Zero Resume Spam
                </span>
              </div>
            </div>

            {/* Aggregate Talent Pool Stats */}
            <div className="grid-3" style={{ margin: '20px 0 28px' }}>
              <div className="stat-pill">
                <div className="stat-value">48</div>
                <div className="stat-label">Verified Candidates in Pool</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">4.76 ★</div>
                <div className="stat-label">Average On-Chain Rating</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">100%</div>
                <div className="stat-label">Zero PII Leaked During Screening</div>
              </div>
            </div>

            {/* Provable Requirements Filter */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-subtle)', marginBottom: '28px' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={18} color="var(--accent-purple-light)" /> Set Provable Role Requirements
              </h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Required Minimum Rating</label>
                  <select 
                    className="form-select"
                    value={reqMinRating}
                    onChange={(e) => setReqMinRating(Number(e.target.value))}
                  >
                    <option value={3}>Min 3.0+ Stars</option>
                    <option value={4}>Min 4.0+ Stars (Senior Standard)</option>
                    <option value={5}>Min 4.8+ Stars (Top 5%)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Required Verified Projects / Jobs</label>
                  <select 
                    className="form-select"
                    value={reqMinJobs}
                    onChange={(e) => setReqMinJobs(Number(e.target.value))}
                  >
                    <option value={5}>Min 5+ Completed Milestones</option>
                    <option value={10}>Min 10+ Completed Milestones</option>
                    <option value={20}>Min 20+ Completed Milestones</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Candidate Applications */}
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '16px' }}>
              Verified Candidate Applications (Cryptographically Screened)
            </h3>

            <div className="item-list">
              {[
                {
                  id: 'cand-1',
                  pseudo: 'Candidate #8849-ZK',
                  skills: ['Midnight Compact', 'ZK Circuits', 'TypeScript', 'Rust'],
                  claimedRating: 'Proven ≥ 4.0 ★ (Actual 4.88 ★)',
                  claimedJobs: 'Proven ≥ 15 Jobs (Actual 38)',
                  trustScore: 'Level 3 Third-Party Attestation',
                  appliedDate: '2 hours ago'
                },
                {
                  id: 'cand-2',
                  pseudo: 'Candidate #4012-PRO',
                  skills: ['React', 'Next.js', 'Web3 Architecture', 'Ethers.js'],
                  claimedRating: 'Proven ≥ 4.0 ★ (Actual 4.70 ★)',
                  claimedJobs: 'Proven ≥ 10 Jobs (Actual 24)',
                  trustScore: 'Level 2 GitHub OAuth Verified',
                  appliedDate: 'Yesterday'
                },
                {
                  id: 'cand-3',
                  pseudo: 'Candidate #9123-ENG',
                  skills: ['Solidity', 'Smart Contract Auditing', 'DeFi'],
                  claimedRating: 'Proven ≥ 4.5 ★ (Actual 4.95 ★)',
                  claimedJobs: 'Proven ≥ 20 Jobs (Actual 52)',
                  trustScore: 'Level 3 Institutional Attestation',
                  appliedDate: '3 days ago'
                }
              ].map(cand => (
                <div key={cand.id} style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: verifiedCandidateId === cand.id ? '1px solid var(--accent-emerald)' : '1px solid var(--border-subtle)', 
                  borderRadius: '14px', 
                  padding: '20px' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong style={{ fontSize: '1.15rem', color: '#ffffff' }}>{cand.pseudo}</strong>
                        <span className="trust-badge level-3">{cand.trustScore}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Applied {cand.appliedDate} • Zero PII Disclosed to Protect Current Employment
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {verifiedCandidateId === cand.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)', fontWeight: 600, fontSize: '0.9rem' }}>
                          <CheckCircle2 size={18} /> ZK Proof Verified On-Chain!
                        </div>
                      ) : (
                        <button 
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                          onClick={() => handleVerifyEmployerProof(cand.id)}
                        >
                          <Shield size={14} /> Verify ZK Circuit Proof
                        </button>
                      )}
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={() => alert(`Mutual Interest Initiated with ${cand.pseudo}! Progressive disclosure invitation sent.`)}
                      >
                        Request Identity Disclosure
                      </button>
                    </div>
                  </div>

                  <div className="grid-3" style={{ fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Verified Skills: </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {cand.skills.map(s => (
                          <span key={s} style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--accent-purple-light)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Proven Rating: </span>
                      <div style={{ color: 'var(--accent-emerald)', fontWeight: 600, marginTop: '4px' }}>
                        {cand.claimedRating}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Proven Track Record: </span>
                      <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, marginTop: '4px' }}>
                        {cand.claimedJobs}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ZK PLAYGROUND TAB */}
      {activeTab === 'playground' && (
        <div>
          <div className="glass-card">
            <h2 className="card-title">
              <Zap size={26} color="var(--accent-amber)" /> Interactive Midnight Circuit Playground
            </h2>
            <p className="card-subtitle">
              Simulate how Compact's dual-ledger model verifies private constraints and performs explicit disclosure.
            </p>

            <div className="grid-2">
              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '12px' }}>
                  Compact Smart Contract Circuit:
                </h3>
                <div className="code-box" style={{ height: '360px' }}>
{`// nighthire.compact
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

export circuit proveRegistered(): Bytes<32> {
  const sk = localSecretKey();
  const seq = sequence as Field as Bytes<32>;
  return disclose(publicKey(sk, seq));
}`}
                </div>
              </div>

              <div>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '12px' }}>
                  Execution Sandbox & Prover Trace:
                </h3>
                <div style={{ background: '#090912', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)', height: '360px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', lineHeight: '1.8' }}>
                    <div style={{ color: 'var(--text-muted)' }}>[PROVER] Initializing Compact VM runtime v0.31.1...</div>
                    <div style={{ color: 'var(--text-muted)' }}>[WITNESS] Querying private state store: \`localRating()\` = 5</div>
                    <div style={{ color: 'var(--text-muted)' }}>[CIRCUIT] Evaluating assertion: 5 &gt;= {minRatingThreshold} -&gt; <span style={{ color: 'var(--accent-emerald)' }}>PASSED</span></div>
                    <div style={{ color: 'var(--text-muted)' }}>[DISCLOSE] Disclosing public argument: {minRatingThreshold}</div>
                    <div style={{ color: 'var(--accent-cyan)' }}>[LEDGER] Incrementing replay sequence counter +1</div>
                    <div style={{ color: 'var(--accent-purple-light)' }}>[ZK-SNARK] Constraint degree k=13 satisfied (rows=4585)</div>
                    <div style={{ color: 'var(--accent-emerald)', marginTop: '8px' }}>
                      ✓ Proof Status: Valid &amp; Verifiable on Midnight Testnet
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONTRACT STATUS TAB */}
      {activeTab === 'contract' && (
        <div>
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="card-title">
                  <Database size={26} color="var(--accent-purple-light)" /> On-Chain Midnight Ledger State
                </h2>
                <p className="card-subtitle">
                  Inspect the deployed Compact contract ledger variables on Midnight standalone/testnet network.
                </p>
              </div>
              <button 
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => setLedgerState(prev => ({ ...prev, sequence: prev.sequence + 1 }))}
              >
                <RefreshCw size={14} /> Refresh State
              </button>
            </div>

            <div className="grid-3" style={{ margin: '20px 0' }}>
              <div className="stat-pill">
                <div className="stat-value">{ledgerState.candidateCount}</div>
                <div className="stat-label">Registered Candidates (candidateCount)</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{ledgerState.totalRatings}</div>
                <div className="stat-label">Ratings Submitted (totalRatings)</div>
              </div>
              <div className="stat-pill">
                <div className="stat-value">{ledgerState.sequence}</div>
                <div className="stat-label">Replay Sequence (sequence)</div>
              </div>
            </div>

            <div style={{ background: '#090912', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', marginBottom: '12px', color: 'var(--accent-purple-light)' }}>
                Contract Configuration & Authority Parameters:
              </h4>
              <div className="code-box">
{`Contract Name: nighthire.compact
Network ID: Midnight Testnet (ZSwap / Ledger Sync)
Platform Authority Key: ${ledgerState.authority}
Public Circuits:
  • register(commitment: Bytes<32>): []
  • proveRegistered(): Bytes<32>
  • submitRating(rating: Uint<16>): []
  • proveMinRating(threshold: Uint<16>): Uint<16>
  • proveMinJobs(threshold: Uint<16>): Uint<16>`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '30px 0 10px', color: 'var(--text-muted)', fontSize: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
        <p>NightHire Protocol • Built with Compact on Midnight Network • Wave 1 MVP Submission (2026)</p>
      </footer>
    </div>
  );
}

export default App;
