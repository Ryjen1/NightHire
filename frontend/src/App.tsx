// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { useCallback, useEffect, useState } from 'react';
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Briefcase,
  UserCheck,
  Building2,
  Key,
  Database,
  Search,
  Award,
  Layers,
  FileCheck2,
  RefreshCw,
  Trash2,
  Plus,
  Lock,
  FlaskConical,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  loadPrivateState,
  savePrivateState,
  clearPrivateState,
  newAuthorityKey,
  newCandidateState,
  bytesToHex,
  hexToBytes,
  loadNightHireRuntime,
  NightHireRuntime,
  type NightHirePrivateState,
  type AuthorityPrivateState,
  type CandidatePrivateState,
} from './services/nightHire';

type Tab = 'overview' | 'candidate' | 'authority' | 'employer' | 'escrow' | 'ledger' | 'source';

interface CircuitLog {
  readonly id: string;
  readonly circuit: string;
  readonly args: string[];
  readonly result: unknown;
  readonly durationMs: number;
  readonly txId: string;
  readonly ok: boolean;
  readonly error?: string;
}

const isAuthority = (p: NightHirePrivateState | null): p is { role: 'authority'; state: AuthorityPrivateState } =>
  !!p && p.role === 'authority';

const isCandidate = (p: NightHirePrivateState | null): p is { role: 'candidate'; state: CandidatePrivateState } =>
  !!p && p.role === 'candidate';

export function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [runtime, setRuntime] = useState<NightHireRuntime | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [deployed, setDeployed] = useState(false);
  void runtimeError;
  const [ledger, setLedger] = useState<any>(() => ({
    authority: '0'.repeat(64),
    candidateCount: 0n,
    totalRatings: 0n,
    ratingSum: 0n,
    completedJobs: 0n,
    sequence: 0n,
    credentialAttestations: {},
    member: () => false,
  }));

  // Lazily load the Compact runtime in the browser. This way, even if the
  // WASM fails to initialize (CSP, network, etc.) the React UI still mounts.
  useEffect(() => {
    (async () => {
      try {
        const { Contract, ledger, ready, error } = await loadNightHireRuntime();
        if (!ready || !Contract) {
          setRuntimeError(error || 'contract module failed to load');
          return;
        }
        setRuntime(new NightHireRuntime(Contract, ledger));
      } catch (e: any) {
        setRuntimeError(e?.message || String(e));
      }
    })();
  }, []);

  const [privateState, setPrivateState] = useState<NightHirePrivateState | null>(() => loadPrivateState());
  const [logs, setLogs] = useState<CircuitLog[]>([]);

  // Refresh ledger display whenever a circuit returns.
  const appendLog = useCallback((log: CircuitLog) => {
    setLogs((prev) => [log, ...prev].slice(0, 30));
  }, []);

  // Re-read the ledger from the runtime (cheap; in-memory copy).
  const refreshLedger = useCallback(() => {
    if (runtime) setLedger(runtime.ledger());
  }, [runtime]);

  // ── Deploy (constructor) ──────────────────────────────────────────────────
  const handleDeploy = useCallback(async () => {
    if (!runtime) return;
    if (!isAuthority(privateState)) return;
    try {
      const r = await runtime.deploy(privateState.state.adminKey, privateState);
      setDeployed(true);
      setLedger(r.ledger);
      appendLog({
        id: r.txId,
        circuit: 'constructor(adminKey)',
        args: [bytesToHex(privateState.state.adminKey).slice(0, 12) + '…'],
        result: bytesToHex(r.result),
        durationMs: r.durationMs,
        txId: r.txId,
        ok: true,
      });
    } catch (e) {
      appendLog({
        id: crypto.randomUUID(),
        circuit: 'constructor(adminKey)',
        args: [],
        result: null,
        durationMs: 0,
        txId: '0'.repeat(64),
        ok: false,
        error: (e as Error).message,
      });
    }
  }, [privateState, runtime, appendLog]);

  // ── Circuit dispatch ─────────────────────────────────────────────────────
  const callCircuit = useCallback(
    async (name: string, args: any[]) => {
      if (!runtime) throw new Error('Runtime not ready — Compact contract failed to load.');
      if (!privateState) throw new Error('No private state — generate authority or candidate first.');
      const t0 = performance.now();
      try {
        const r = await runtime.call(name, args, privateState);
        refreshLedger();
        appendLog({
          id: r.txId,
          circuit: name,
          args: args.map(a => (a instanceof Uint8Array ? bytesToHex(a).slice(0, 10) + '…' : String(a))),
          result: typeof r.result === 'bigint' ? r.result.toString() : r.result,
          durationMs: r.durationMs,
          txId: r.txId,
          ok: true,
        });
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        return r;
      } catch (e) {
        const err = (e as Error).message;
        appendLog({
          id: crypto.randomUUID(),
          circuit: name,
          args: args.map(a => (a instanceof Uint8Array ? bytesToHex(a).slice(0, 10) + '…' : String(a))),
          result: null,
          durationMs: performance.now() - t0,
          txId: '0'.repeat(64),
          ok: false,
          error: err,
        });
        throw e;
      }
    },
    [privateState, runtime, refreshLedger, appendLog]
  );

  // ── State management helpers ──────────────────────────────────────────────
  const generateAuthority = () => {
    const adminKey = newAuthorityKey();
    const ps: NightHirePrivateState = { role: 'authority', state: adminKey };
    setPrivateState(ps);
    savePrivateState(ps);
  };
  const generateCandidate = () => {
    const st = newCandidateState();
    const ps: NightHirePrivateState = { role: 'candidate', state: st };
    setPrivateState(ps);
    savePrivateState(ps);
  };
  const resetAll = () => {
    clearPrivateState();
    setPrivateState(null);
    setLogs([]);
    setDeployed(false);
  };

  // ── UI ──────────────────────────────────────────────────────────────────
  return (
    <div className="app-container">
      <header className="navbar">
        <a href="#home" className="brand-logo" onClick={() => setTab('overview')}>
          <img src="/assets/logo.png" alt="NightHire" style={{ width: 38, height: 38, borderRadius: 10, objectFit: 'cover' }} />
          <span>Night<span style={{ color: 'var(--accent-purple-light)' }}>Hire</span></span>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(139,92,246,0.18)',
            border: '1px solid var(--border-active)',
            padding: '2px 8px',
            borderRadius: 9999,
            color: 'var(--accent-purple-light)',
            marginLeft: 12,
          }}>
            🌑 Midnight Buildathon · Wave 2
          </span>
        </a>
        <nav className="nav-links">
          <NavLink active={tab==='overview'}  onClick={() => setTab('overview')}  icon={<Layers/>}>Overview</NavLink>
          <NavLink active={tab==='candidate'} onClick={() => setTab('candidate')} icon={<UserCheck/>}>Candidate</NavLink>
          <NavLink active={tab==='authority'} onClick={() => setTab('authority')} icon={<Shield/>}>Authority</NavLink>
          <NavLink active={tab==='employer'}  onClick={() => setTab('employer')}  icon={<Building2/>}>Employer</NavLink>
          <NavLink active={tab==='escrow'}    onClick={() => setTab('escrow')}    icon={<Briefcase/>}>Escrow</NavLink>
          <NavLink active={tab==='ledger'}    onClick={() => setTab('ledger')}    icon={<Database/>}>Ledger</NavLink>
          <NavLink active={tab==='source'}    onClick={() => setTab('source')}    icon={<FileCheck2/>}>Contract</NavLink>
        </nav>
      </header>

      {!runtime && !privateState && (
        <section className="glass-card" style={{ marginTop: 20 }}>
          <p style={{ color: 'var(--text-muted)' }}>
            🌑 Loading Midnight Compact runtime…
            <br/>
            <span style={{ fontSize: '0.8rem' }}>
              If this message persists, the WASM runtime failed to load (browser cache, CSP, or CDN issue).
              Try opening DevTools → Network and reloading.
            </span>
          </p>
          {runtimeError && (
            <p style={{ color: 'var(--accent-warning)', fontSize: '0.85rem', marginTop: 8 }}>
              Runtime error: {runtimeError}
            </p>
          )}
        </section>
      )}

      {!privateState && (
        <section className="glass-card" style={{ marginTop: 20 }}>
          <h2 className="card-title">
            <FlaskConical size={26} color="var(--accent-purple-light)" />
            Choose your role
          </h2>
          <p className="card-subtitle">
            NightHire's privacy model requires each role to hold different private keys.
            Pick the role you want to demo; the keys live only in your browser (localStorage).
          </p>
          <div className="grid-2" style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={generateAuthority}>
              <Shield size={18} /> I am the Authority (register candidates, issue credentials)
            </button>
            <button className="btn btn-secondary" onClick={generateCandidate}>
              <UserCheck size={18} /> I am a Candidate (prove ratings, salary band, jurisdiction)
            </button>
          </div>
          <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Lock size={14}/> &nbsp; All values are generated in-browser with <code>crypto.getRandomValues</code> and never sent anywhere. This page runs the real Compact contract directly via <code>@midnight-ntwrk/compact-runtime</code>.
          </p>
        </section>
      )}

      {privateState && (
        <section className="glass-card" style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <strong style={{ color: 'var(--accent-cyan)' }}>Role:</strong>{' '}
            <span style={{ textTransform: 'uppercase' }}>{privateState.role}</span>
            {isAuthority(privateState) && (
              <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                adminKey 0x…{bytesToHex(privateState.state.adminKey).slice(-8)}
              </span>
            )}
            {isCandidate(privateState) && (
              <span style={{ marginLeft: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                secretKey 0x…{bytesToHex(privateState.state.secretKey).slice(-8)} · rating {privateState.state.rating.toString()} · jobs {privateState.state.completedJobs.toString()}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!deployed && isAuthority(privateState) && (
              <button className="btn btn-primary" onClick={handleDeploy}>
                <Zap size={16}/> Deploy contract (constructor)
              </button>
            )}
            {deployed && <span style={{ color: 'var(--accent-emerald)', fontSize: '0.85rem' }}>✓ contract initialised · authority stored</span>}
            <button className="btn btn-ghost" onClick={resetAll}>
              <Trash2 size={14}/> Reset
            </button>
          </div>
        </section>
      )}

      {/* TAB: OVERVIEW */}
      {tab === 'overview' && <OverviewScreen deployed={deployed} ledger={ledger} />}

      {/* TAB: CANDIDATE */}
      {tab === 'candidate' && privateState && (
        <CandidateScreen
          ps={isCandidate(privateState) ? privateState.state : null}
          deployed={deployed}
          onCall={callCircuit}
        />
      )}

      {/* TAB: AUTHORITY */}
      {tab === 'authority' && privateState && (
        <AuthorityScreen
          ps={isAuthority(privateState) ? privateState.state : null}
          deployed={deployed}
          onCall={callCircuit}
        />
      )}

      {/* TAB: EMPLOYER */}
      {tab === 'employer' && <EmployerScreen deployed={deployed} ledger={ledger} onCall={callCircuit} ps={privateState} />}

      {/* TAB: ESCROW */}
      {tab === 'escrow' && <EscrowScreen deployed={deployed} ps={privateState} onCall={callCircuit} />}

      {/* TAB: LEDGER */}
      {tab === 'ledger' && <LedgerScreen ledger={ledger} logs={logs} onRefresh={refreshLedger} />}

      {/* TAB: SOURCE */}
      {tab === 'source' && <ContractSourceScreen />}

      <footer style={{ marginTop: 60, padding: '24px 0', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>
          🌑 NightHire · Privacy-first progressive-disclosure hiring · Midnight Buildathon Wave 2 ·
          Built on <code>nighthire.compact</code> + <code>escrow.compact</code> · Apache-2.0
        </p>
      </footer>
    </div>
  );
}

function NavLink({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={'nav-link' + (active ? ' nav-link-active' : '')}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

// ─── OVERVIEW ───────────────────────────────────────────────────────────────

function OverviewScreen({ deployed, ledger }: { deployed: boolean; ledger: any }) {
  return (
    <section className="grid-3" style={{ marginTop: 20 }}>
      <div className="glass-card stat-pill">
        <div className="stat-value">{ledger.candidateCount.toString()}</div>
        <div className="stat-label">Registered Candidates (public)</div>
      </div>
      <div className="glass-card stat-pill">
        <div className="stat-value">{ledger.totalRatings.toString()}</div>
        <div className="stat-label">Ratings Submitted (public aggregate)</div>
      </div>
      <div className="glass-card stat-pill">
        <div className="stat-value">{ledger.sequence.toString()}</div>
        <div className="stat-label">Replay Sequence</div>
      </div>

      <div className="glass-card" style={{ gridColumn: 'span 3' }}>
        <h2 className="card-title"><Award size={26} color="var(--accent-emerald)"/> How NightHire's privacy model works</h2>
        <p>
          Every check below is enforced inside the Compact contract's zero-knowledge circuit. The <em>private</em> column never
          leaves the witness provider's machine; only the <em>public</em> column is written to the ledger.
        </p>
        <table className="privacy-table">
          <thead>
            <tr><th>Circuit</th><th>Witness (private)</th><th>Public output</th><th>Verified property</th></tr>
          </thead>
          <tbody>
            <tr><td>proveMinRating</td><td>localRating</td><td>threshold ≥ 4 ★</td><td>exact rating never leaks</td></tr>
            <tr><td>proveMinJobs</td><td>localCompletedJobs</td><td>count ≥ threshold</td><td>exact count never leaks</td></tr>
            <tr><td>proveRegistered</td><td>localSecretKey</td><td>registration token hash</td><td>identity stays anonymous</td></tr>
            <tr><td>proveCredential</td><td>localCredentialId, localCredentialSalt</td><td>yes / no</td><td>credential id stays private</td></tr>
            <tr><td>proveSalaryFits</td><td>localSalaryLower, localSalaryUpper</td><td>fits / doesn't fit</td><td>salary band stays private</td></tr>
            <tr><td>proveJurisdiction</td><td>localJurisdictionHash</td><td>yes / no</td><td>jurisdiction name stays private</td></tr>
          </tbody>
        </table>
        <p style={{ marginTop: 12, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {deployed
            ? <>✓ Contract initialised — every circuit above is callable from the Candidate / Authority / Employer tabs.</>
            : <>Deploy the contract first (Authority tab → "Deploy contract").</>}
        </p>
      </div>
    </section>
  );
}

// ─── CANDIDATE ──────────────────────────────────────────────────────────────

function CandidateScreen({
  ps, deployed, onCall,
}: { ps: CandidatePrivateState | null; deployed: boolean; onCall: (n: string, a: any[]) => Promise<any> }) {
  const [threshold, setThreshold] = useState(4n);
  const [jobLower, setJobLower] = useState(100_000n);
  const [jobUpper, setJobUpper] = useState(180_000n);
  const [salaryResult, setSalaryResult] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);

  if (!ps) return <p style={{ color: 'var(--text-muted)' }}>Switch role to Candidate first.</p>;

  return (
    <section className="grid-2" style={{ marginTop: 20 }}>
      <div className="glass-card">
        <h2 className="card-title"><UserCheck/> Identity & credentials</h2>
        <p className="card-subtitle">Run circuits that prove facts about you without revealing them.</p>

        <button
          className="btn btn-primary"
          disabled={!deployed}
          onClick={async () => {
            try {
              const r = await onCall('proveRegistered', []);
              setRegistrationToken(typeof r.result === 'string' ? r.result : bytesToHex(r.result as Uint8Array));
            } catch { /* logged */ }
          }}
        >
          <Key size={16} /> proveRegistered (reg token hash)
        </button>

        {registrationToken && (
          <pre style={{ marginTop: 10, padding: 10, background: '#0e0e1a', borderRadius: 8, fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            {registrationToken}
          </pre>
        )}
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Award/> Reputation thresholds (private)</h2>
        <p className="card-subtitle">My rating = <strong>{ps.rating.toString()}</strong> · jobs = <strong>{ps.completedJobs.toString()}</strong> (kept private)</p>
        <label>proveMinRating threshold:&nbsp;
          <input type="number" min={1} max={5} value={Number(threshold)} onChange={(e) => setThreshold(BigInt(e.target.value))} style={{ width: 80, padding: '4px 8px', borderRadius: 6, background: '#1a1a2e', color: '#eee', border: '1px solid var(--border-active)' }} />
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn btn-secondary" disabled={!deployed} onClick={() => onCall('proveMinRating', [threshold]).catch(() => {})}>
            ✓ Rating ≥ threshold
          </button>
          <button className="btn btn-secondary" disabled={!deployed} onClick={() => onCall('proveMinJobs', [10n]).catch(() => {})}>
            ✓ Jobs ≥ 10
          </button>
        </div>
        {threshold > ps.rating && (
          <p style={{ color: 'var(--accent-warning)', fontSize: '0.8rem', marginTop: 8 }}>
            <AlertTriangle size={14}/> threshold higher than your rating — circuit will reject (this is the privacy guarantee!).
          </p>
        )}
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Search/> Salary band overlap (private)</h2>
        <p className="card-subtitle">My band: <strong>${ps.salaryLower.toString()}</strong> – <strong>${ps.salaryUpper.toString()}</strong> (kept private)</p>
        <label>Job lower: <input type="number" value={Number(jobLower)} onChange={(e) => setJobLower(BigInt(e.target.value))} style={{ width: 120, padding: '4px 8px', borderRadius: 6, background: '#1a1a2e', color: '#eee', border: '1px solid var(--border-active)' }} /></label>
        <label>Job upper: <input type="number" value={Number(jobUpper)} onChange={(e) => setJobUpper(BigInt(e.target.value))} style={{ width: 120, padding: '4px 8px', borderRadius: 6, background: '#1a1a2e', color: '#eee', border: '1px solid var(--border-active)', marginLeft: 8 }} /></label>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-secondary" disabled={!deployed} onClick={async () => {
            try {
              await onCall('proveSalaryFits', [jobLower, jobUpper]);
              setSalaryResult('FITS');
            } catch {
              setSalaryResult('DOES NOT FIT');
            }
          }}>
            ✓ Prove overlap
          </button>
        </div>
        {salaryResult && (
          <p style={{ marginTop: 8, color: salaryResult === 'FITS' ? 'var(--accent-emerald)' : 'var(--accent-warning)' }}>
            {salaryResult}
          </p>
        )}
      </div>

      <div className="glass-card">
        <h2 className="card-title"><CheckCircle2/> Credential + jurisdiction</h2>
        <p className="card-subtitle">Prove possession of an attestation; prove you match the employer's jurisdiction allow-list.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" disabled={!deployed} onClick={() => onCall('proveCredential', []).catch(() => {})}>
            ✓ I hold my Level-3 attestation
          </button>
          <button className="btn btn-secondary" disabled={!deployed} onClick={() => onCall('proveJurisdiction', [ps.jurisdictionHash]).catch(() => {})}>
            ✓ My jurisdiction matches employer's allow-list
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── AUTHORITY ──────────────────────────────────────────────────────────────

function AuthorityScreen({
  ps, deployed, onCall,
}: { ps: AuthorityPrivateState | null; deployed: boolean; onCall: (n: string, a: any[]) => Promise<any> }) {
  const [commitmentHex, setCommitmentHex] = useState('');
  const [ratingTarget, setRatingTarget] = useState('0x' + new Uint8Array(32).toString ? '' : '');

  // Generate a fresh commitment for demo purposes.
  const freshCommitment = () => {
    const buf = new Uint8Array(32);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(buf);
    setCommitmentHex('0x' + bytesToHex(buf));
    setRatingTarget(bytesToHex(buf));
  };

  if (!ps) return <p style={{ color: 'var(--text-muted)' }}>Switch role to Authority first.</p>;

  return (
    <section className="grid-2" style={{ marginTop: 20 }}>
      <div className="glass-card">
        <h2 className="card-title"><Shield/> Register candidates</h2>
        <p className="card-subtitle">
          When a real-world candidate passes KYC, the platform authority registers their commitment on-chain.
          The candidate then proves attributes against it without ever revealing who they are.
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            placeholder="0x… commitment"
            value={commitmentHex}
            onChange={(e) => setCommitmentHex(e.target.value)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)', fontFamily: 'monospace', fontSize: '0.85rem' }}
          />
          <button className="btn btn-secondary" onClick={freshCommitment}>
            <RefreshCw size={14}/> Generate
          </button>
        </div>
        <button
          className="btn btn-primary"
          style={{ marginTop: 10 }}
          disabled={!deployed || !commitmentHex.startsWith('0x') || commitmentHex.length !== 66}
          onClick={async () => {
            try {
              await onCall('register', [hexToBytes(commitmentHex.slice(2))]);
            } catch { /* logged */ }
          }}
        >
          <Plus size={14}/> register(commitment)
        </button>
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Briefcase/> Issue credential</h2>
        <p className="card-subtitle">
          Stores hash(candidateCommitment, localCredentialId, localCredentialSalt) on-chain. Candidate later proves possession of
          (credId, salt) inside ZK without leaking either.
        </p>
        <button
          className="btn btn-primary"
          disabled={!deployed || !ratingTarget}
          onClick={() => onCall('issueCredential', [hexToBytes(ratingTarget)]).catch(() => {})}
        >
          <FileCheck2 size={14}/> issueCredential(candidate)
        </button>
        <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          The credential id + salt are pulled from the candidate's witness (not visible to the UI).
        </p>
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Briefcase/> Submit a public rating</h2>
        <p className="card-subtitle">1–5 stars; aggregates update; individual rating values are never individually disclosed (only via the running sum).</p>
        <label>Commitment to rate:&nbsp;
          <input value={ratingTarget} onChange={(e) => setRatingTarget(e.target.value)} style={{ width: 280, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)', fontFamily: 'monospace', fontSize: '0.85rem' }} />
        </label>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              className="btn btn-secondary"
              disabled={!deployed || !ratingTarget}
              onClick={() => onCall('submitRating', [hexToBytes(ratingTarget), BigInt(r)]).catch(() => {})}
            >
              ★ {r}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── EMPLOYER ───────────────────────────────────────────────────────────────

function EmployerScreen({ deployed, ledger, onCall, ps }: { deployed: boolean; ledger: any; onCall: (n: string, a: any[]) => Promise<any>; ps: NightHirePrivateState | null }) {
  const [ratingMin, setRatingMin] = useState(4);
  const [jobsMin, setJobsMin] = useState(10);
  const [jobBandLower, setJobBandLower] = useState(120_000);
  const [jobBandUpper, setJobBandUpper] = useState(180_000);

  return (
    <section className="grid-2" style={{ marginTop: 20 }}>
      <div className="glass-card">
        <h2 className="card-title"><Building2/> Define screening criteria</h2>
        <p>Set the criteria a candidate must meet. Candidates prove privately; you only learn PASS/FAIL.</p>
        <label>Min rating ★: <input type="number" min={1} max={5} value={ratingMin} onChange={(e) => setRatingMin(Number(e.target.value))} style={{ width: 60, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)' }}/></label>
        <label style={{ marginLeft: 12 }}>Min jobs: <input type="number" min={0} value={jobsMin} onChange={(e) => setJobsMin(Number(e.target.value))} style={{ width: 60, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)' }}/></label>
        <p style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          When a candidate submits proof, the contract runs the threshold checks against their private values without revealing them.
        </p>
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Layers/> Live applicant queue</h2>
        <p className="card-subtitle">All registered candidates appear here — but with zero PII, only commitment hashes.</p>
        {Object.keys(ledger.credentialAttestations).length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No candidates registered yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {Object.entries(ledger.credentialAttestations).map(([k, v]) => (
              <li key={k} style={{ padding: '8px 10px', background: '#0e0e1a', borderRadius: 6, marginBottom: 6, fontSize: '0.85rem' }}>
                <code style={{ color: 'var(--accent-cyan)' }}>0x{k.slice(0, 12)}…{k.slice(-6)}</code>{' '}
                <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>{v === k ? '(credential pending)' : '(attestation issued)'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Search/> Verify a candidate's proof</h2>
        <p>Run a verification as the candidate — produces a transparent PASS/FAIL trace.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" disabled={!deployed || !ps || ps.role !== 'candidate'} onClick={() => onCall('proveMinRating', [BigInt(ratingMin)]).catch(() => {})}>
            Verify rating ≥ {ratingMin}
          </button>
          <button className="btn btn-secondary" disabled={!deployed || !ps || ps.role !== 'candidate'} onClick={() => onCall('proveMinJobs', [BigInt(jobsMin)]).catch(() => {})}>
            Verify jobs ≥ {jobsMin}
          </button>
        </div>
        {ps && ps.role === 'authority' && (
          <p style={{ color: 'var(--accent-warning)', marginTop: 8, fontSize: '0.85rem' }}>
            Switch role to Candidate to verify — verification uses the candidate's private values.
          </p>
        )}
      </div>

      <div className="glass-card">
        <h2 className="card-title"><Search/> Salary band fit</h2>
        <p>Job band: ${jobBandLower.toLocaleString()} – ${jobBandUpper.toLocaleString()}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" value={jobBandLower} onChange={(e) => setJobBandLower(Number(e.target.value))} style={{ width: 120, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)' }} />
          <input type="number" value={jobBandUpper} onChange={(e) => setJobBandUpper(Number(e.target.value))} style={{ width: 120, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)' }} />
        </div>
        <button className="btn btn-secondary" disabled={!deployed || !ps || ps.role !== 'candidate'} onClick={() => onCall('proveSalaryFits', [BigInt(jobBandLower), BigInt(jobBandUpper)]).catch(() => {})}>
          Verify overlap
        </button>
      </div>
    </section>
  );
}

// ─── ESCROW ─────────────────────────────────────────────────────────────────

function EscrowScreen({ deployed, ps, onCall }: { deployed: boolean; ps: NightHirePrivateState | null; onCall: (n: string, a: any[]) => Promise<any> }) {
  const [employerCommitment, setEmployerCommitment] = useState('');
  const [candidateCommitment, setCandidateCommitment] = useState('');
  const [amount, setAmount] = useState(1000n);
  const [milestones, setMilestones] = useState(4n);
  const [escrowId, setEscrowId] = useState<bigint | null>(null);

  if (!ps) return <p style={{ color: 'var(--text-muted)' }}>Choose a role to use the escrow screen.</p>;

  return (
    <section className="grid-2" style={{ marginTop: 20 }}>
      <div className="glass-card">
        <h2 className="card-title"><Briefcase/> Open escrow (Wave-2)</h2>
        <p className="card-subtitle">
          Employer locks funds to milestone releases. The candidate proves milestone index privately; only releases happen on-chain.
        </p>
        <label>Employer commitment: <input value={employerCommitment} onChange={(e) => setEmployerCommitment(e.target.value)} style={{ width: 380, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)', fontFamily: 'monospace', fontSize: '0.85rem' }} /></label>
        <label>Candidate commitment: <input value={candidateCommitment} onChange={(e) => setCandidateCommitment(e.target.value)} style={{ width: 380, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)', fontFamily: 'monospace', fontSize: '0.85rem' }} /></label>
        <label>Amount: <input type="number" value={Number(amount)} onChange={(e) => setAmount(BigInt(e.target.value))} style={{ width: 120, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)' }}/></label>
        <label>Milestones: <input type="number" min={1} value={Number(milestones)} onChange={(e) => setMilestones(BigInt(e.target.value))} style={{ width: 80, padding: '4px 8px', borderRadius: 6, background: '#0e0e1a', color: '#eee', border: '1px solid var(--border-active)', marginLeft: 8 }}/></label>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" disabled={!deployed || ps.role !== 'authority' || !employerCommitment.startsWith('0x') || !candidateCommitment.startsWith('0x')} onClick={async () => {
            try {
              const r = await onCall('openEscrow', [hexToBytes(employerCommitment.slice(2)), hexToBytes(candidateCommitment.slice(2)), amount, milestones]);
              setEscrowId(r.result);
            } catch { /* logged */ }
          }}>
            <Plus size={14}/> openEscrow
          </button>
          {escrowId !== null && (
            <p style={{ color: 'var(--accent-emerald)', marginTop: 8 }}>
              ✓ Escrow opened: <code>#{escrowId.toString()}</code> ({amount.toString()} split into {milestones.toString()} milestones of {(amount / milestones).toString()} each)
            </p>
          )}
        </div>
        {ps.role !== 'authority' && (
          <p style={{ color: 'var(--accent-warning)', marginTop: 8, fontSize: '0.85rem' }}>
            Switch to Authority role to open an escrow.
          </p>
        )}
      </div>

      <div className="glass-card">
        <h2 className="card-title"><CheckCircle2/> Release milestone</h2>
        <p className="card-subtitle">Authority releases the next milestone; candidate's <code>localMilestoneProof</code> witness keeps the index private.</p>
        {escrowId === null ? (
          <p style={{ color: 'var(--text-muted)' }}>Open an escrow first.</p>
        ) : (
          <>
            <p>Active escrow: <code>#{escrowId.toString()}</code></p>
            <button className="btn btn-secondary" onClick={() => onCall('releaseMilestone', [escrowId, amount / milestones]).catch(() => {})}>
              ✓ Release next milestone
            </button>
          </>
        )}
      </div>
    </section>
  );
}

// ─── LEDGER ─────────────────────────────────────────────────────────────────

function LedgerScreen({ ledger, logs, onRefresh }: { ledger: any; logs: CircuitLog[]; onRefresh: () => void }) {
  return (
    <section style={{ marginTop: 20 }}>
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title"><Database/> On-chain ledger</h2>
          <button className="btn btn-secondary" onClick={onRefresh}><RefreshCw size={14}/> Refresh</button>
        </div>
        <div className="grid-3" style={{ marginTop: 16 }}>
          <div className="stat-pill"><div className="stat-value">{ledger.candidateCount.toString()}</div><div className="stat-label">candidateCount</div></div>
          <div className="stat-pill"><div className="stat-value">{ledger.totalRatings.toString()}</div><div className="stat-label">totalRatings</div></div>
          <div className="stat-pill"><div className="stat-value">{ledger.completedJobs.toString()}</div><div className="stat-label">completedJobs</div></div>
          <div className="stat-pill"><div className="stat-value">{ledger.ratingSum.toString()}</div><div className="stat-label">ratingSum</div></div>
          <div className="stat-pill"><div className="stat-value">{ledger.sequence.toString()}</div><div className="stat-label">sequence</div></div>
          <div className="stat-pill"><div className="stat-value" style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>0x{ledger.authority.slice(0, 16)}…</div><div className="stat-label">authority (public hash)</div></div>
        </div>

        <h3 style={{ marginTop: 24 }}>credentialAttestations ({Object.keys(ledger.credentialAttestations).length} entries)</h3>
        <div style={{ maxHeight: 240, overflowY: 'auto' }}>
          <table className="privacy-table">
            <thead><tr><th>commitment</th><th>attestation hash</th><th>state</th></tr></thead>
            <tbody>
              {Object.entries(ledger.credentialAttestations).map(([k, v]) => (
                <tr key={k}>
                  <td><code>0x{k.slice(0, 12)}…{k.slice(-6)}</code></td>
                  <td><code>0x{String(v).slice(0, 12)}…{String(v).slice(-6)}</code></td>
                  <td>{v === k ? 'register-only' : 'attestation-issued'}</td>
                </tr>
              ))}
              {Object.keys(ledger.credentialAttestations).length === 0 && (
                <tr><td colSpan={3} style={{ color: 'var(--text-muted)' }}>Empty</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: 20 }}>
        <h2 className="card-title"><FileCheck2/> Circuit-call log (this session)</h2>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No circuits called yet.</p>
        ) : (
          <table className="privacy-table">
            <thead><tr><th>✓/✗</th><th>Circuit</th><th>Args</th><th>Result</th><th>Tx</th><th>Duration</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.ok ? <CheckCircle2 size={14} color="var(--accent-emerald)" /> : <AlertTriangle size={14} color="var(--accent-warning)" />}</td>
                  <td><code>{l.circuit}</code></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l.args.join(', ')}</td>
                  <td><code style={{ fontSize: '0.75rem' }}>{l.error ? <span style={{ color: 'var(--accent-warning)' }}>{l.error}</span> : String(l.result ?? '—').slice(0, 40)}</code></td>
                  <td><code style={{ fontSize: '0.65rem', color: 'var(--accent-purple-light)' }}>0x{l.txId.slice(0, 12)}…</code></td>
                  <td style={{ fontSize: '0.75rem' }}>{l.durationMs.toFixed(1)}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

// ─── CONTRACT SOURCE ────────────────────────────────────────────────────────

function ContractSourceScreen() {
  const [source, setSource] = useState<string>('');
  const [escrow, setEscrow] = useState<string>('');

  useEffect(() => {
    fetch('/nighthire.compact')
      .then((r) => r.text())
      .then(setSource)
      .catch(() => setSource('# nighthire.compact — placed in /boilerplate/contract/src/, served here for in-app verification.'));
    fetch('/escrow.compact')
      .then((r) => r.text())
      .then(setEscrow)
      .catch(() => setEscrow('# escrow.compact — placed in /boilerplate/contract/src/wave2/.'));
  }, []);

  return (
    <section style={{ marginTop: 20 }}>
      <div className="glass-card">
        <h2 className="card-title"><FileCheck2/> nighthire.compact — the on-chain privacy contract</h2>
        <p className="card-subtitle">
          This is the source the deployed contract was compiled from. 8 user-facing circuits; all use witnesses for
          any privacy-sensitive computation. Sequence counter increments force full ZK proof generation (see the
          <code> contract-info.json </code> in <code>boilerplate/contract/src/managed/nighthire/</code>).
        </p>
        <pre style={{ background: '#0a0a14', padding: 16, borderRadius: 8, overflow: 'auto', maxHeight: 480, fontSize: '0.8rem', color: '#cdd6f4', fontFamily: 'JetBrains Mono, monospace' }}>
{source}
        </pre>
      </div>

      <div className="glass-card" style={{ marginTop: 20 }}>
        <h2 className="card-title"><FileCheck2/> escrow.compact — milestone escrow (Wave-2)</h2>
        <p className="card-subtitle">5 circuits; releases happen with a private milestone index.</p>
        <pre style={{ background: '#0a0a14', padding: 16, borderRadius: 8, overflow: 'auto', maxHeight: 360, fontSize: '0.8rem', color: '#cdd6f4', fontFamily: 'JetBrains Mono, monospace' }}>
{escrow}
        </pre>
      </div>
    </section>
  );
}

export default App;
