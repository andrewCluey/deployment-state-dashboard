import { useState } from 'react';

const STATUS_CONFIG = {
  succeeded:  { label: 'Succeeded',   dot: '#22c55e', ring: '#16a34a' },
  failed:     { label: 'Failed',      dot: '#ef4444', ring: '#dc2626' },
  inprogress: { label: 'In Progress', dot: '#f59e0b', ring: '#d97706' },
  none:       { label: 'Not run',     dot: '#9ca3af', ring: '#6b7280' },
};

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function normaliseStatus(raw) {
  if (!raw) return 'none';
  const s = raw.toLowerCase();
  if (s === 'succeeded' || s === 'success')                    return 'succeeded';
  if (s === 'failed'    || s === 'failure')                    return 'failed';
  if (s === 'inprogress' || s === 'running' || s === 'in_progress') return 'inprogress';
  return 'none';
}

function TrafficLight({ status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: 'inline-block',
      width: 14, height: 14,
      borderRadius: '50%',
      background: cfg.dot,
      boxShadow: `0 0 0 ${status === 'inprogress' ? '2px' : '1.5px'} ${cfg.ring}55`,
      flexShrink: 0,
      animation: status === 'inprogress' ? 'pulse 1.6s ease-in-out infinite' : 'none',
    }} />
  );
}

export default function StatusCell({ row }) {
  const [hover, setHover] = useState(false);
  const status = normaliseStatus(row?.status);
  const cfg = STATUS_CONFIG[status];

  return (
    <td
      style={{ padding: '10px 12px', textAlign: 'center', position: 'relative', verticalAlign: 'middle' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <TrafficLight status={status} />
        {row?.version && (
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10, color: '#64748b', letterSpacing: '-0.02em',
          }}>
            {row.version}
          </span>
        )}
      </div>

      {hover && row && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#0f172a',
          color: '#f8fafc',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: 11.5,
          lineHeight: 1.7,
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          minWidth: 200,
          textAlign: 'left',
          animation: 'fadeIn 0.12s ease',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginBottom: 6, paddingBottom: 6,
            borderBottom: '1px solid #334155',
          }}>
            <TrafficLight status={status} />
            <span style={{ fontWeight: 600, fontSize: 12, color: cfg.dot }}>{cfg.label}</span>
          </div>
          {row.version       && <div><span style={{ color: '#94a3b8' }}>Version: </span>{row.version}</div>}
          {row.pipelineRunId && <div><span style={{ color: '#94a3b8' }}>Run ID: </span>#{row.pipelineRunId}</div>}
          {row.commit        && (
            <div>
              <span style={{ color: '#94a3b8' }}>Commit: </span>
              <span style={{ fontFamily: 'monospace' }}>{row.commit.slice(0, 7)}</span>
            </div>
          )}
          {row.lastUpdated && (
            <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>
              {formatDateTime(row.lastUpdated)}
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: -5, left: '50%',
            transform: 'translateX(-50%)',
            width: 10, height: 10, background: '#0f172a',
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          }} />
        </div>
      )}
    </td>
  );
}
