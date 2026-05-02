'use client';

import { useEffect, useRef, useState } from 'react';
import { TerminalMessage, TERMINAL_MESSAGES } from '@/lib/data';

interface Props {
  height?: number;
  title?: string;
}

export default function Terminal({ height = 320, title = 'AXL P2P MESH — MESSAGE TERMINAL' }: Props) {
  const [lines, setLines] = useState<TerminalMessage[]>([]);
  const [visible, setVisible] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fade in initial messages one by one
  useEffect(() => {
    const msgs = [...TERMINAL_MESSAGES].reverse();
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        setLines(prev => [...prev, msg]);
        setVisible(prev => [...prev, msg.id]);
      }, i * 180);
    });
  }, []);

  // Append new messages periodically
  useEffect(() => {
    const extra: TerminalMessage[] = [
      { id: 101, ts: '', from: 'ARIA', to: 'APEX',  type: 'TASK',   payload: 'analyze gas trends — window=100 blocks', color: '#00FF88' },
      { id: 102, ts: '', from: 'APEX', to: 'ARIA',  type: 'RESULT', payload: 'avg_gas=82,300 — suggest lower limit', color: '#FF4500' },
      { id: 103, ts: '', from: 'AIDEN', to: 'ARIA', type: 'AUDIT',  payload: 'risk assessment complete — score=8.9/10', color: '#0066FF' },
      { id: 104, ts: '', from: 'ARIA', to: 'APEX',  type: 'TASK',   payload: 'trigger cycle #48', color: '#00FF88' },
    ];
    let idx = 0;
    const iv = setInterval(() => {
      const now = new Date();
      const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      const msg = { ...extra[idx % extra.length], id: 200 + idx, ts };
      idx++;
      setLines(prev => [...prev.slice(-30), msg]);
      setVisible(prev => [...prev, msg.id]);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A' }}>
      {/* Terminal header */}
      <div
        style={{
          background: '#0A0A0A',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: '#00FF88',
          }}
        >
          {title}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#FF4500', '#00FF88', '#0066FF'].map((c, i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                background: c,
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'inline-block',
              }}
            />
          ))}
        </div>
      </div>

      {/* Terminal body */}
      <div
        className="terminal"
        style={{ height, overflowY: 'auto' }}
      >
        <div style={{ color: '#444', marginBottom: '0.5rem', fontSize: '0.65rem' }}>
          {'> SYNAPSE AXL MESH v1.0.0 — CONNECTED TO 3 PEERS'}
        </div>
        <div style={{ color: '#444', marginBottom: '1rem', fontSize: '0.65rem' }}>
          {'> TYPE `help` FOR COMMANDS · SHOWING LIVE MESSAGE FEED'}
        </div>
        {lines.map(line => (
          <div
            key={line.id}
            className="terminal-line"
            style={{
              opacity: visible.includes(line.id) ? 1 : 0,
              marginBottom: '0.25rem',
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#444', minWidth: 60 }}>{line.ts}</span>
            <span style={{ color: line.color, fontWeight: 700, minWidth: 50 }}>[{line.from}]</span>
            <span style={{ color: '#666' }}>→</span>
            <span style={{ color: '#888', minWidth: 50 }}>[{line.to}]</span>
            <span style={{ color: '#555', minWidth: 70 }}>{line.type}:</span>
            <span style={{ color: '#CCCCCC', flex: 1 }}>{line.payload}</span>
          </div>
        ))}
        <div ref={bottomRef} />
        {/* Blinking cursor */}
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 14,
            background: '#00FF88',
            marginTop: 4,
            animation: 'counterBlip 0.8s infinite',
          }}
        />
      </div>
    </div>
  );
}
