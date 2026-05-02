'use client';

import { motion } from 'framer-motion';
import NetworkGraph from '@/components/NetworkGraph';
import { AGENTS } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';

export default function NetworkPage() {
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }} className="grid-bg">

      {/* ── STATUS BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          border: '3px solid #0A0A0A',
          boxShadow: '6px 6px 0px #00FF88',
          background: '#0A0A0A',
          padding: '1.5rem 2.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#00FF88',
              lineHeight: 1,
            }}
          >
            AXL P2P NETWORK
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: '#555', marginTop: 6, textTransform: 'uppercase' }}>
            AXELAR P2P MESH — SYNAPSE SWARM COMMUNICATIONS
          </p>
        </div>
        <div
          style={{
            border: '3px solid #00FF88',
            padding: '0.75rem 2rem',
            boxShadow: '4px 4px 0px #00FF88',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 14,
                height: 14,
                background: '#00FF88',
                display: 'inline-block',
                animation: 'pulse-green 1.5s infinite',
              }}
            />
            <span
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#00FF88',
                letterSpacing: '0.1em',
              }}
            >
              MESH ONLINE
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem',
        }}
      >
        {/* Network graph */}
        <div>
          <div className="section-header">
            <span style={{ background: '#00FF88', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            LIVE NODE GRAPH
          </div>
          <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', background: '#F5F0E8', padding: '1.5rem' }}>
            <NetworkGraph />
          </div>
        </div>

        {/* Peer details */}
        <div>
          <div className="section-header">
            <span style={{ background: '#FF4500', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            PEER DIRECTORY
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AGENTS.map((agent, i) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{
                  border: '3px solid #0A0A0A',
                  boxShadow: `4px 4px 0px ${agent.color}`,
                  background: '#FFFFFF',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: agent.color,
                      textShadow: '1px 1px 0px #0A0A0A',
                    }}
                  >
                    {agent.name}
                  </div>
                  <StatusBadge status={agent.status} size="sm" />
                </div>

                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.58rem', color: '#888', letterSpacing: '0.04em', marginBottom: 8, wordBreak: 'break-all' }}>
                  {agent.peerId}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {[
                    { label: 'ENS',   value: agent.ens },
                    { label: 'PEERS', value: agent.peers.join(', ').toUpperCase() },
                    { label: 'LATENCY', value: '12ms' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', borderTop: '1px solid #E0D8C8', paddingTop: 4 }}>
                      <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</span>
                      <span style={{ fontWeight: 700, color: '#0A0A0A' }}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Protocol info */}
          <div
            style={{
              marginTop: 12,
              border: '3px solid #0A0A0A',
              boxShadow: '4px 4px 0px #0A0A0A',
              background: '#0A0A0A',
              padding: '1rem',
            }}
          >
            {[
              { label: 'PROTOCOL',   value: 'AXL P2P v1' },
              { label: 'TRANSPORT',  value: 'WebSocket / QUIC' },
              { label: 'ENCRYPTION', value: 'X25519-AEAD' },
              { label: 'ROUTING',    value: 'Kademlia DHT' },
            ].map(r => (
              <div
                key={r.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.62rem',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span style={{ color: '#555', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: '#00FF88' }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MESSAGE TYPES LEGEND ── */}
      <div style={{ marginTop: '1.5rem' }}>
        <div className="section-header">
          <span style={{ background: '#0066FF', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
          MESSAGE TYPE LEGEND
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {[
            { type: 'TASK',    color: '#00FF88', desc: 'Agent assigns work to peer' },
            { type: 'RESULT',  color: '#FF4500', desc: 'Execution output returned' },
            { type: 'AUDIT',   color: '#0066FF', desc: 'Compliance check from AIDEN' },
            { type: 'NOTIFY',  color: '#FFFFFF', desc: 'State change broadcast' },
            { type: 'ERROR',   color: '#CC0000', desc: 'Failure report from agent' },
          ].map(item => (
            <div
              key={item.type}
              style={{
                border: '3px solid #0A0A0A',
                boxShadow: '3px 3px 0px #0A0A0A',
                background: '#FFFFFF',
                padding: '0.75rem',
              }}
            >
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: item.color === '#FFFFFF' ? '#0A0A0A' : item.color,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                  textShadow: item.color === '#FFFFFF' ? 'none' : '1px 1px 0px rgba(10,10,10,0.2)',
                }}
              >
                {item.type}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.58rem',
                  color: '#666',
                  lineHeight: 1.4,
                }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
