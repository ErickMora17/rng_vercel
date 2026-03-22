'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, getVideoUrl } from '../lib/api';

const BUTTONS = [
  'Y', 'X', 'L', 'R',
  'B', 'A', 'ZL', 'ZR',
  'DPAD_UP', 'DPAD_LEFT', 'DPAD_RIGHT', 'DPAD_DOWN',
  'HOME', 'PLUS', 'MINUS', '__SOFT_RESET__',
];

function formatMs(ms) {
  const n = Number(ms || 0);
  return `${(n / 1000).toFixed(3)} s`;
}

export default function RemotePanel() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const videoUrl = useMemo(() => getVideoUrl(), []);

  async function refreshStatus() {
    try {
      const data = await apiGet('/api/status');
      setStatus(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function runAction(name, fn) {
    try {
      setBusy(name);
      setError('');
      await fn();
      await refreshStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  useEffect(() => {
    refreshStatus();
    const id = setInterval(refreshStatus, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main style={{ maxWidth: 1180, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginTop: 0 }}>RNG Switch Remote</h1>
      <p style={{ color: '#cbd5e1' }}>Vercel frontend talking to the Raspberry Pi backend through your tunnel.</p>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: '2fr 1fr' }}>
        <div style={{ background: '#111827', borderRadius: 16, padding: 16 }}>
          <div style={{ marginBottom: 12, color: '#cbd5e1' }}>{status?.message || 'Loading status...'}</div>
          {videoUrl ? (
            <img
              src={videoUrl}
              alt="Switch stream"
              style={{ width: '100%', borderRadius: 12, background: '#000' }}
            />
          ) : (
            <div>No NEXT_PUBLIC_API_BASE configured.</div>
          )}
        </div>

        <div style={{ background: '#111827', borderRadius: 16, padding: 16 }}>
          <div><strong>Controller:</strong> {status?.controller_connected ? 'Connected' : 'Disconnected'}</div>
          <div><strong>Timer:</strong> {status?.running ? 'Running' : 'Stopped'}</div>
          <div><strong>Macro:</strong> {status?.macro_running ? 'Running' : 'Stopped'}</div>
          <div><strong>Keep alive:</strong> {status?.keep_alive_running ? 'Running' : 'Stopped'}</div>
          <div><strong>Resets:</strong> {status?.reset_count ?? 0}</div>
          <hr style={{ borderColor: '#1f2937', margin: '14px 0' }} />
          <div><strong>Macro phase:</strong> {status?.macro_phase_name || 'Idle'}</div>
          <div><strong>Target:</strong> {formatMs(status?.macro_phase_target_ms)}</div>
          <div><strong>Elapsed:</strong> {formatMs(status?.macro_phase_elapsed_ms)}</div>
          <div><strong>Remaining:</strong> {formatMs(status?.macro_phase_remaining_ms)}</div>
          {error ? <p style={{ color: '#fca5a5' }}>{error}</p> : null}
        </div>
      </section>

      <section style={{ background: '#111827', borderRadius: 16, padding: 16, marginTop: 16 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          <ActionButton label="Start Timer" busy={busy === 'startTimer'} onClick={() => runAction('startTimer', () => apiPost('/api/timer/start'))} />
          <ActionButton label="Stop Timer" busy={busy === 'stopTimer'} onClick={() => runAction('stopTimer', () => apiPost('/api/timer/stop'))} />
          <ActionButton label="Start Macro" busy={busy === 'startMacro'} onClick={() => runAction('startMacro', () => apiPost('/api/macro/start'))} />
          <ActionButton label="Replay Macro" busy={busy === 'replayMacro'} onClick={() => runAction('replayMacro', () => apiPost('/api/macro/replay'))} />
          <ActionButton label="Stop Macro" busy={busy === 'stopMacro'} onClick={() => runAction('stopMacro', () => apiPost('/api/macro/stop'))} />
          <ActionButton label="Start Keep Alive" busy={busy === 'startKeepAlive'} onClick={() => runAction('startKeepAlive', () => apiPost('/api/keep-alive/start'))} />
          <ActionButton label="Stop Keep Alive" busy={busy === 'stopKeepAlive'} onClick={() => runAction('stopKeepAlive', () => apiPost('/api/keep-alive/stop'))} />
          <ActionButton label="Reset Counter = 0" busy={busy === 'resetCounter'} onClick={() => runAction('resetCounter', () => apiPost('/api/reset-counter/reset'))} />
        </div>
      </section>

      <section style={{ background: '#111827', borderRadius: 16, padding: 16, marginTop: 16 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
          {BUTTONS.map((button) => (
            <ActionButton
              key={button}
              label={button === '__SOFT_RESET__' ? 'Soft Reset' : button}
              busy={busy === button}
              onClick={() => runAction(button, () => apiPost('/api/button', { button }))}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

function ActionButton({ label, onClick, busy }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        padding: 14,
        borderRadius: 12,
        border: 'none',
        background: busy ? '#334155' : '#2563eb',
        color: '#fff',
        fontWeight: 700,
        cursor: busy ? 'wait' : 'pointer',
      }}
    >
      {busy ? 'Working...' : label}
    </button>
  );
}
