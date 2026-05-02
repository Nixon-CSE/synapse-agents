'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AgentCard from '@/components/AgentCard';
import Terminal from '@/components/Terminal';
import RetryDemo from '@/components/RetryDemo';
import TxRow from '@/components/TxRow';
import { AGENTS, KV_STORE, TX_RECORDS, CONTRACTS } from '@/lib/data';

export default function DashboardPage() {
  const [block, setBlock] = useState(4182847);
  const [time, setTime] = useState('');

  // Tick block & clock
  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-GB'));
    const iv = setInterval(() => {
      setBlock(b => b + 1);
      setTime(new Date().toLocaleTimeString('en-GB'));
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }} className="grid-bg">

      {/* ═══════════════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '2rem' }}>
        {/* OS Banner */}
        <div
          style={{
            border: '3px solid #0A0A0A',
            boxShadow: '6px 6px 0px #0A0A0A',
            background: '#0A0A0A',
            padding: '2rem 2.5rem',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                lineHeight: 0.95,
                marginBottom: '0.5rem',
              }}
            >
              SYNAPSE<span style={{ color: '#00FF88' }}>_</span>OS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                letterSpacing: '0.15em',
                color: '#666',
                textTransform: 'uppercase',
              }}
            >
              AI AGENT SWARM COMMAND CENTER · 0G GALILEO TESTNET
            </motion.p>
          </div>

          {/* Live stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'BLOCK', value: block.toLocaleString(), color: '#00FF88' },
              { label: 'AGENTS ONLINE', value: '3 / 3', color: '#00FF88' },
              { label: 'LOCAL TIME', value: time, color: '#FFFFFF' },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  border: '2px solid rgba(255,255,255,0.15)',
                  padding: '0.6rem 1rem',
                  textAlign: 'right',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.55rem',
                    letterSpacing: '0.15em',
                    color: '#555',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: stat.color,
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'SynapseNFT', addr: CONTRACTS.SynapseNFT },
            { label: 'AgentRegistry', addr: CONTRACTS.AgentRegistry },
          ].map(c => (
            <div
              key={c.label}
              style={{
                border: '2px solid #0A0A0A',
                background: '#FFFFFF',
                padding: '0.3rem 0.8rem',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6rem',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{c.label}:</span>
              <span style={{ color: '#666' }}>{c.addr}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          AGENT CARDS (3 COLUMN)
      ═══════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <span style={{ background: '#00FF88', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
          ACTIVE AGENTS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
          }}
        >
          {AGENTS.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TERMINAL + KV STORE (2 COLUMN)
      ═══════════════════════════════════════════════════════════ */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* AXL Terminal */}
        <div>
          <div className="section-header">
            <span style={{ background: '#FF4500', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            AXL P2P TERMINAL
          </div>
          <Terminal height={360} />
        </div>

        {/* 0G KV Store */}
        <div>
          <div className="section-header">
            <span style={{ background: '#0066FF', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            0G STORAGE — KEY / VALUE VIEWER
          </div>
          <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', overflow: 'hidden' }}>
            <table className="brutalist-table">
              <thead>
                <tr>
                  <th>KEY</th>
                  <th>VALUE</th>
                  <th>TYPE</th>
                  <th>TTL</th>
                </tr>
              </thead>
              <tbody>
                {KV_STORE.map(kv => (
                  <tr key={kv.key}>
                    <td
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.6rem',
                        color: '#00AA55',
                        padding: '0.5rem 0.75rem',
                        border: '2px solid #0A0A0A',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {kv.key}
                    </td>
                    <td
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.6rem',
                        padding: '0.5rem 0.75rem',
                        border: '2px solid #0A0A0A',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {kv.value}
                    </td>
                    <td
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.58rem',
                        fontWeight: 700,
                        padding: '0.5rem 0.75rem',
                        border: '2px solid #0A0A0A',
                        color: '#0066FF',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {kv.type}
                    </td>
                    <td
                      style={{
                        fontFamily: "'Space Mono', monospace",
                        fontSize: '0.58rem',
                        padding: '0.5rem 0.75rem',
                        border: '2px solid #0A0A0A',
                        color: '#888',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {kv.ttl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Storage stats */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              marginTop: 8,
              border: '3px solid #0A0A0A',
              boxShadow: '4px 4px 0px #0A0A0A',
            }}
          >
            {[
              { label: 'TOTAL KEYS', value: '270' },
              { label: 'USED SPACE', value: '3.2 MB' },
              { label: 'REPLICATION', value: '3×' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRight: i < 2 ? '2px solid #0A0A0A' : undefined,
                  background: '#FFFFFF',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1rem', fontWeight: 700, color: '#0A0A0A', marginTop: 2 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          KEEPERHUB TX LIST + RETRY DEMO (2 COLUMN)
      ═══════════════════════════════════════════════════════════ */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: '1.5rem',
        }}
      >
        {/* TX Table */}
        <div>
          <div className="section-header">
            <span style={{ background: '#FF4500', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            KEEPERHUB — TRANSACTION HISTORY
          </div>
          <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', overflowX: 'auto' }}>
            <table className="brutalist-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>AGENT</th>
                  <th>ACTION</th>
                  <th>HASH</th>
                  <th>ATTEMPTS</th>
                  <th>GAS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {TX_RECORDS.map(tx => <TxRow key={tx.id} tx={tx} />)}
              </tbody>
            </table>
          </div>
        </div>

        {/* Retry Demo */}
        <div>
          <div className="section-header">
            <span style={{ background: '#0066FF', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            RETRY ENGINE — LIVE DEMO
          </div>
          <RetryDemo />
        </div>
      </section>
    </div>
  );
}
