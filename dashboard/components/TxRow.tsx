'use client';

import { TxRecord } from '@/lib/data';

interface Props {
  tx: TxRecord;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  SUCCESS: { bg: '#00FF88', color: '#0A0A0A', label: '✓ SUCCESS' },
  FAILED:  { bg: '#FF4500', color: '#FFFFFF', label: '✕ FAILED'  },
  PENDING: { bg: '#E0D8C8', color: '#0A0A0A', label: '○ PENDING' },
  RETRYING:{ bg: '#0066FF', color: '#FFFFFF', label: '↻ RETRY'   },
};

export default function TxRow({ tx }: Props) {
  const s = STATUS_STYLES[tx.status] ?? STATUS_STYLES.PENDING;
  const agentColor = tx.agent === 'APEX' ? '#FF4500' : tx.agent === 'ARIA' ? '#00FF88' : '#0066FF';

  return (
    <tr>
      <td
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.65rem',
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
          color: '#888',
          whiteSpace: 'nowrap',
        }}
      >
        {tx.timestamp}
      </td>
      <td
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.65rem',
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
          fontWeight: 700,
          color: agentColor,
          textShadow: '1px 1px 0px #0A0A0A',
        }}
      >
        {tx.agent}
      </td>
      <td
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.63rem',
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
        }}
      >
        {tx.action}
      </td>
      <td
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.63rem',
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
          color: '#666',
        }}
      >
        {tx.hash}
      </td>
      <td
        style={{
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
          textAlign: 'center',
        }}
      >
        {/* Attempt dots */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          {Array.from({ length: tx.maxAttempts }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 12,
                height: 12,
                background: i < tx.attempt - 1 ? '#FF4500' : i === tx.attempt - 1 ? s.bg : '#E0D8C8',
                border: '2px solid #0A0A0A',
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </td>
      <td
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.63rem',
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
          color: '#666',
        }}
      >
        {tx.gas}
      </td>
      <td
        style={{
          padding: '0.6rem 0.75rem',
          border: '2px solid #0A0A0A',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.6rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            background: s.bg,
            color: s.color,
            padding: '2px 8px',
            border: '2px solid #0A0A0A',
            whiteSpace: 'nowrap',
          }}
        >
          {s.label}
        </span>
      </td>
    </tr>
  );
}
