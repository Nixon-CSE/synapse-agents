'use client';

import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AGENTS, CONTRACTS } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import Terminal from '@/components/Terminal';

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = AGENTS.find(a => a.id === params.id);
  if (!agent) notFound();

  const mainMetricLabel =
    agent.id === 'aria' ? 'CONFIDENCE' :
    agent.id === 'apex' ? 'SUCCESS RATE' : 'AUDITS DONE';
  const mainMetricValue =
    agent.id === 'aria' ? `${agent.confidence}%` :
    agent.id === 'apex' ? `${agent.successRate}%` : `${agent.audits}`;

  const peerAgents = AGENTS.filter(a => agent.peers.includes(a.id));

  const LOG_COLORS: Record<string, string> = {
    INFO: '#00FF88',
    WARN: '#FF4500',
    ERROR: '#CC0000',
    DEBUG: '#888',
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }} className="grid-bg">
      {/* Back */}
      <Link
        href="/agents"
        className="btn btn-black"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', gap: 8 }}
      >
        ← BACK TO ROSTER
      </Link>

      {/* ── HERO HEADER ── */}
      <div
        style={{
          border: '3px solid #0A0A0A',
          boxShadow: `6px 6px 0px ${agent.color}`,
          background: '#0A0A0A',
          padding: '2.5rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '2rem',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <h1
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 'clamp(3rem, 7vw, 5rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: agent.color,
                lineHeight: 1,
              }}
            >
              {agent.name}
            </h1>
            <StatusBadge status={agent.status} size="lg" />
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: '#666',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            {agent.role} · {agent.ens}
          </div>
          {/* Metric chips */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'iNFT TOKEN ID', value: `#${agent.tokenId}` },
              { label: 'ENS NAME',      value: agent.ens },
              { label: 'CYCLE COUNT',   value: agent.cycles },
              { label: mainMetricLabel, value: mainMetricValue },
            ].map(c => (
              <div
                key={c.label}
                style={{
                  border: `2px solid ${agent.color}`,
                  padding: '0.5rem 1rem',
                  background: 'transparent',
                }}
              >
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', letterSpacing: '0.12em', color: '#555', textTransform: 'uppercase', marginBottom: 2 }}>{c.label}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.9rem', fontWeight: 700, color: agent.color }}>{c.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Big token display */}
        <div
          style={{
            width: 160,
            height: 160,
            background: agent.color,
            border: '3px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: agent.id === 'aria' ? '#0A0A0A' : '#000', letterSpacing: '0.12em', textTransform: 'uppercase' }}>iNFT</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '3rem', fontWeight: 700, color: agent.id === 'aria' ? '#0A0A0A' : '#000', lineHeight: 1 }}>#{agent.tokenId}</div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: agent.id === 'aria' ? '#0A0A0A' : '#000', letterSpacing: '0.08em', opacity: 0.7, marginTop: 4 }}>SYNAPSE NFT</div>
        </div>
      </div>

      {/* ── MAIN 2-COL LAYOUT ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {/* Memory Snapshot */}
        <div>
          <div className="section-header">
            <span style={{ background: agent.color, width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            0G STORAGE — MEMORY SNAPSHOT
          </div>
          <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', background: '#FFFFFF', padding: '1.5rem' }}>
            {/* Memory progress */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', marginBottom: 6, letterSpacing: '0.08em' }}>
                <span>MEMORY USAGE</span>
                <span style={{ fontWeight: 700 }}>{agent.memory.used} / {agent.memory.total} KB ({Math.round((agent.memory.used / agent.memory.total) * 100)}%)</span>
              </div>
              <div className="progress-track">
                <motion.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(agent.memory.used / agent.memory.total) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ background: agent.color, borderRight: '2px solid #0A0A0A' }}
                />
              </div>
            </div>

            {/* Key-value stats */}
            {[
              { k: 'TOTAL KEYS',    v: agent.memory.keys },
              { k: 'USED SPACE',    v: `${agent.memory.used} KB` },
              { k: 'FREE SPACE',    v: `${agent.memory.total - agent.memory.used} KB` },
              { k: 'REPLICATION',   v: '3×' },
              { k: 'NETWORK',       v: '0G Galileo Testnet' },
              { k: 'STORAGE NODE',  v: '0x0G…stor1' },
            ].map(row => (
              <div
                key={row.k}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #0A0A0A',
                  padding: '0.5rem 0',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                }}
              >
                <span style={{ color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{row.k}</span>
                <span style={{ fontWeight: 700, color: '#0A0A0A' }}>{row.v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AXL Peer Connections */}
        <div>
          <div className="section-header">
            <span style={{ background: '#FF4500', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            AXL PEER CONNECTIONS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Self */}
            <div
              style={{
                border: `3px solid ${agent.color}`,
                boxShadow: `4px 4px 0px ${agent.color}`,
                background: '#0A0A0A',
                padding: '1rem',
              }}
            >
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>SELF</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: agent.color }}>{agent.name}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.58rem', color: '#555', marginTop: 4, letterSpacing: '0.04em' }}>{agent.peerId}</div>
            </div>

            {/* Peers */}
            {peerAgents.map(peer => (
              <Link key={peer.id} href={`/agents/${peer.id}`} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: -2, y: -2 }}
                  style={{
                    border: '3px solid #0A0A0A',
                    boxShadow: `4px 4px 0px #0A0A0A`,
                    background: '#FFFFFF',
                    padding: '1rem',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.12s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>PEER</div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.1rem', fontWeight: 700, color: peer.color }}>{peer.name}</div>
                    </div>
                    <StatusBadge status={peer.status} size="sm" />
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.58rem', color: '#888', letterSpacing: '0.04em' }}>{peer.peerId}</div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.58rem', color: '#666', marginTop: 4 }}>{peer.ens} · iNFT #{peer.tokenId}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── LOG ENTRIES ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="section-header">
          <span style={{ background: '#00FF88', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
          RECENT LOG ENTRIES
        </div>
        <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', background: '#0A0A0A', padding: '1rem 1.25rem' }}>
          {agent.logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex',
                gap: 12,
                padding: '0.35rem 0',
                borderBottom: i < agent.logs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : undefined,
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.68rem',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ color: '#444', minWidth: 56 }}>{log.ts}</span>
              <span
                style={{
                  color: LOG_COLORS[log.level],
                  fontWeight: 700,
                  minWidth: 52,
                  letterSpacing: '0.06em',
                }}
              >
                [{log.level}]
              </span>
              <span style={{ color: '#CCCCCC', flex: 1 }}>{log.msg}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div className="section-header">
        <span style={{ background: agent.color, width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
        AGENT CONTROLS
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button
          className="btn"
          style={{ background: agent.color, color: agent.id === 'aria' ? '#0A0A0A' : '#FFFFFF', fontSize: '0.8rem', padding: '0.75rem 2rem' }}
          onClick={() => alert(`Triggering cycle for ${agent.name}...`)}
        >
          ▶ TRIGGER CYCLE
        </button>
        <a
          href={`${CONTRACTS.explorer}/token/${CONTRACTS.SynapseNFT}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-black"
          style={{ fontSize: '0.8rem', padding: '0.75rem 2rem' }}
        >
          ⬡ VIEW ON 0G
        </a>
        <button
          className="btn btn-white"
          style={{ fontSize: '0.8rem', padding: '0.75rem 2rem' }}
          onClick={() => alert(`Syncing ${agent.name} memory from 0G Storage...`)}
        >
          ↻ SYNC MEMORY
        </button>
        <button
          className="btn"
          style={{ background: '#0066FF', color: '#FFFFFF', fontSize: '0.8rem', padding: '0.75rem 2rem' }}
          onClick={() => alert(`Pinging ${agent.name} via AXL P2P...`)}
        >
          ◉ PING PEER
        </button>
      </div>
    </div>
  );
}
