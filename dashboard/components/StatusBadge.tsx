'use client';

import { AgentStatus } from '@/lib/data';

interface Props {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
}

const STATUS_CONFIG: Record<AgentStatus, { color: string; bg: string; pulse: string | null; label: string }> = {
  THINKING:  { color: '#0A0A0A', bg: '#00FF88', pulse: 'pulse-green',  label: '◉ THINKING'  },
  EXECUTING: { color: '#FFFFFF', bg: '#FF4500', pulse: 'pulse-orange', label: '▶ EXECUTING' },
  APPROVED:  { color: '#FFFFFF', bg: '#0066FF', pulse: null,           label: '✓ APPROVED'  },
  IDLE:      { color: '#0A0A0A', bg: '#E0D8C8', pulse: null,           label: '○ IDLE'       },
  ERROR:     { color: '#FFFFFF', bg: '#CC0000', pulse: null,           label: '✕ ERROR'      },
};

const SIZE_CONFIG = {
  sm: { fontSize: '0.58rem', padding: '2px 8px', borderRadius: 2 },
  md: { fontSize: '0.65rem', padding: '4px 12px', borderRadius: 2 },
  lg: { fontSize: '0.8rem',  padding: '6px 16px', borderRadius: 2 },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status];
  const sz  = SIZE_CONFIG[size];

  return (
    <span
      className={cfg.pulse ?? ''}
      style={{
        display: 'inline-block',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: cfg.color,
        background: cfg.bg,
        border: '2px solid #0A0A0A',
        boxShadow: '2px 2px 0px #0A0A0A',
        whiteSpace: 'nowrap',
        ...sz,
      }}
    >
      {cfg.label}
    </span>
  );
}
