// SPDX-License-Identifier: Apache-2.0
// Copyright 2026 Ryjen1 (NightHire contributors)
// Licensed under the Apache License, Version 2.0

import { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

class ErrorBoundary extends Component<{ children: ReactNode }, { err: string | null }> {
  state = { err: null as string | null };
  static getDerivedStateFromError(err: Error) {
    return { err: err?.message + '\n\n' + (err?.stack || '') };
  }
  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('NightHire crashed:', err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{
          padding: 32, fontFamily: 'monospace', color: '#e0e0ff',
          background: '#0a0a14', minHeight: '100vh', whiteSpace: 'pre-wrap',
        }}>
          <h1 style={{ color: '#ff7b7b' }}>🌑 NightHire failed to load</h1>
          <p style={{ color: '#888' }}>An error occurred during React initialization.
          This is shown by the in-app error boundary so it never appears as a blank page.</p>
          <pre style={{
            background: '#1a1a2e', padding: 16, borderRadius: 8, marginTop: 16,
            color: '#ff7b7b', fontSize: '0.85rem', overflow: 'auto',
          }}>{this.state.err}</pre>
          <p style={{ color: '#888', marginTop: 16 }}>
            Likely cause: the Compact runtime WASM failed to initialize
            (CSP, MIME, or service-worker issue). Try opening
            DevTools → Network and look for the .wasm file.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Surface any uncaught error visibly so the page is never blank.
window.addEventListener('error', (e) => {
  console.error('uncaught:', e.error);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<pre style="padding:32px;color:#ff7b7b;background:#0a0a14;font-family:monospace;white-space:pre-wrap">uncaught: ${(e.error as Error)?.message || e.message}\n${(e.error as Error)?.stack || ''}</pre>`;
  }
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('unhandledrejection:', e.reason);
  const root = document.getElementById('root');
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `<pre style="padding:32px;color:#ff7b7b;background:#0a0a14;font-family:monospace;white-space:pre-wrap">unhandledrejection: ${(e.reason as Error)?.message || e.reason}</pre>`;
  }
});

const rootEl = document.getElementById('root')!;
createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
