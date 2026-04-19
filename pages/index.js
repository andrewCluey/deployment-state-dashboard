import { useState, useEffect, useCallback } from 'react';
import StatusCell, { normaliseStatus } from '../components/StatusCell';

const ENVIRONMENTS = ['dev', 'qa', 'sit', 'uat', 'preprod', 'prod'];
const ENV_LABELS   = { dev: 'Dev', qa: 'QA', sit: 'SIT', uat: 'UAT', preprod: 'PreProd', prod: 'Prod' };
const REFRESH_MS   = 60_000;

const STATUS_CONFIG = {
  succeeded:  { label: 'Succeeded',   dot: '#22c55e' },
  failed:     { label: 'Failed',      dot: '#ef4444' },
  inprogress: { label: 'In Progress', dot: '#f59e0b' },
  none:       { label: 'Not run',     dot: '#9ca3af' },
};

/* ── Data helpers ── */

function buildMatrix(rows) {
  const services = {};
  rows.forEach(row => {
    const svc = row.partitionKey;
    const env = row.rowKey?.toLowerCase();
    if (!services[svc]) services[svc] = {};
    services[svc][env] = row;
  });
  return services;
}

function summaryStats(matrix) {
  let succeeded = 0, failed = 0, inprogress = 0, none = 0;
  Object.values(matrix).forEach(envs => {
    ENVIRONMENTS.forEach(env => {
      const s = normaliseStatus(envs[env]?.status);
      if      (s === 'succeeded')  succeeded++;
      else if (s === 'failed')     failed++;
      else if (s === 'inprogress') inprogress++;
      else                         none++;
    });
  });
  return { succeeded, failed, inprogress, none };
}

function timeAgo(iso) {
  if (!iso) return null;
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/* ── Sub-components ── */

function SummaryBadge({ label, count, color, bg }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 20,
      background: bg, border: `1px solid ${color}33`,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      <span style={{ fontSize: 13, fontWeight: 500, color }}>{count}</span>
      <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
    </div>
  );
}

function RefreshIcon({ spinning }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
      style={{ animation: spinning ? 'spin 0.8s linear infinite' : 'none' }}>
      <path d="M13 7A6 6 0 1 1 7 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M13 1v6h-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Main page ── */

export default function Home() {
  const [matrix, setMatrix]         = useState({});
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]         = useState('');
  const [usingMock, setUsingMock]   = useState(false);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // Calls our Next.js API route — which runs server-side
      const res = await fetch('/api/pipelines');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail || body.error || `HTTP ${res.status}`);
      }
      const { data, usingMock: mock } = await res.json();
      setMatrix(buildMatrix(data));
      setUsingMock(mock);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  const services = Object.keys(matrix)
    .filter(s => !filter || s.toLowerCase().includes(filter.toLowerCase()))
    .sort();

  const stats = summaryStats(matrix);
  const totalServices = Object.keys(matrix).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Sora', sans-serif" }}>
      <style>{`
        table { border-collapse: collapse; width: 100%; }
        th, td { border-bottom: 1px solid #e2e8f0; }
        tr:last-child td { border-bottom: none; }
        tbody tr:hover td { background: #f1f5f9; transition: background 0.1s; }
        input::placeholder { color: #94a3b8; }
        input:focus { outline: none; border-color: #6366f1 !important; box-shadow: 0 0 0 3px #6366f120; }
        button:hover { background: #f1f5f9 !important; }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0 32px', display: 'flex', alignItems: 'center',
        height: 64, gap: 16, position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#6366f1" strokeWidth="1.5"/>
            <circle cx="8"  cy="14" r="2.5" fill="#6366f1"/>
            <circle cx="20" cy="14" r="2.5" fill="#6366f1"/>
            <line x1="10.5" y1="14" x2="17.5" y2="14" stroke="#6366f1" strokeWidth="1.5"/>
            <line x1="5"  y1="10" x2="5"  y2="14" stroke="#6366f1" strokeWidth="1.5"/>
            <line x1="23" y1="14" x2="23" y2="18" stroke="#6366f1" strokeWidth="1.5"/>
          </svg>
          <span style={{ fontSize: 17, fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Pipeline Status
          </span>
        </div>

        {usingMock && (
          <span style={{
            fontSize: 11, background: '#fef9c3', color: '#854d0e',
            border: '1px solid #fde047', borderRadius: 4,
            padding: '2px 8px', fontWeight: 500,
          }}>
            Demo data — set AZURE_STORAGE_ACCOUNT in .env.local to connect
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {lastRefresh && (
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              {refreshing ? 'Refreshing…' : `Updated ${timeAgo(lastRefresh.toISOString())}`}
            </span>
          )}
          <button
            onClick={() => load(true)}
            disabled={loading || refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#fff',
              fontSize: 13, color: '#475569', cursor: 'pointer',
              fontFamily: "'Sora', sans-serif", transition: 'background 0.15s',
            }}
          >
            <RefreshIcon spinning={refreshing} />
            Refresh
          </button>
        </div>
      </header>

      <main style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Summary bar ── */}
        {!loading && !error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#94a3b8', marginRight: 4 }}>
              {totalServices} service{totalServices !== 1 ? 's' : ''}
            </span>
            <SummaryBadge label="succeeded"   count={stats.succeeded}  color="#16a34a" bg="#f0fdf4" />
            <SummaryBadge label="failed"      count={stats.failed}     color="#dc2626" bg="#fef2f2" />
            <SummaryBadge label="in progress" count={stats.inprogress} color="#d97706" bg="#fffbeb" />
            <SummaryBadge label="not run"     count={stats.none}       color="#6b7280" bg="#f9fafb" />

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                placeholder="Filter services…"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                style={{
                  padding: '7px 12px', borderRadius: 8,
                  border: '1px solid #e2e8f0', fontSize: 13,
                  color: '#0f172a', background: '#fff', width: 200,
                  fontFamily: "'Sora', sans-serif", transition: 'border-color 0.15s',
                }}
              />
              {filter && (
                <button
                  onClick={() => setFilter('')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
                >×</button>
              )}
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
              <RefreshIcon spinning={true} />
            </div>
            <p style={{ fontSize: 14 }}>Loading pipeline statuses…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && !loading && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: 10, padding: '20px 24px', color: '#7f1d1d',
          }}>
            <strong style={{ display: 'block', marginBottom: 6 }}>Failed to load pipeline data</strong>
            <code style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{error}</code>
            <br />
            <button
              onClick={() => load()}
              style={{
                marginTop: 12, padding: '6px 14px', borderRadius: 6,
                border: '1px solid #fca5a5', background: '#fff',
                color: '#7f1d1d', cursor: 'pointer', fontSize: 13,
              }}
            >
              Try again
            </button>
          </div>
        )}

        {/* ── Main table ── */}
        {!loading && !error && (
          <div style={{
            background: '#fff', borderRadius: 12,
            border: '1px solid #e2e8f0', overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
          }}>
            <table>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{
                    padding: '12px 20px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.06em', width: '22%',
                  }}>
                    Service
                  </th>
                  {ENVIRONMENTS.map(env => (
                    <th key={env} style={{
                      padding: '12px 12px', textAlign: 'center',
                      fontSize: 11, fontWeight: 600, color: '#64748b',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {ENV_LABELS[env]}
                    </th>
                  ))}
                  <th style={{
                    padding: '12px 16px', textAlign: 'right',
                    fontSize: 11, fontWeight: 600, color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
                  }}>
                    Last run
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={ENVIRONMENTS.length + 2} style={{
                      padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14,
                    }}>
                      No services match your filter.
                    </td>
                  </tr>
                ) : services.map(svc => {
                  const envs = matrix[svc] || {};
                  const lastRun = ENVIRONMENTS
                    .map(e => envs[e]?.lastUpdated)
                    .filter(Boolean)
                    .sort()
                    .at(-1);

                  return (
                    <tr key={svc}>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{
                          fontWeight: 500, fontSize: 14, color: '#0f172a',
                          fontFamily: "'JetBrains Mono', monospace",
                          letterSpacing: '-0.02em',
                        }}>
                          {svc}
                        </span>
                      </td>

                      {ENVIRONMENTS.map(env => (
                        <StatusCell key={env} row={envs[env]} />
                      ))}

                      <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        {lastRun ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                            <span style={{ fontSize: 12, color: '#0f172a' }}>{formatDateTime(lastRun)}</span>
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>{timeAgo(lastRun)}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Legend ── */}
        {!loading && !error && (
          <div style={{ marginTop: 20, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontSize: 11, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600,
            }}>Legend</span>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  display: 'inline-block', width: 10, height: 10,
                  borderRadius: '50%', background: cfg.dot,
                }} />
                <span style={{ fontSize: 12, color: '#64748b' }}>{cfg.label}</span>
              </div>
            ))}
            <span style={{ fontSize: 11, color: '#b0bac4', marginLeft: 8 }}>
              Version = last successful deploy. Hover a cell for full details.
            </span>
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 11, color: '#cbd5e1', textAlign: 'center' }}>
          Pipeline status only — does not indicate whether the service is running or healthy.
          Auto-refreshes every 60 seconds.
        </p>
      </main>
    </div>
  );
}
