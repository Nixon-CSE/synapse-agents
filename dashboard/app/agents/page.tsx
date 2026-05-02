'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AgentCard from '@/components/AgentCard';
import Terminal from '@/components/Terminal';
import RetryDemo from '@/components/RetryDemo';
import TxRow from '@/components/TxRow';
import { AGENTS, KV_STORE, TX_RECORDS, CONTRACTS } from '@/lib/data';
import { getAgents, getSwarm, getMemory, getLogs } from '@/lib/api';

export default function DashboardPage() {
  const [block, setBlock] = useState(4182847);
  const [time, setTime] = useState('');

  // ── LIVE API STATE ──────────────────────────
  const [liveAgents, setLiveAgents] = useState(AGENTS);
  const [liveSwarm, setLiveSwarm] = useState<any>(null);
  const [liveMemory, setLiveMemory] = useState<any>(null);
  const [liveLogs, setLiveLogs] = useState<any[]>([]);
  const [apiOnline, setApiOnline] = useState(false);

  // ── FETCH ALL DATA ──────────────────────────
  async function fetchAll() {
    try {
      const [a, s, m, l] = await Promise.all([
        getAgents(),
        getSwarm(),
        getMemory(),
        getLogs()
      ]);
      if (a?.agents?.length) {
        setLiveAgents(a.agents);
        setApiOnline(true);
      }
      if (s) setLiveSwarm(s);
      if (m) setLiveMemory(m);
      if (l?.messages?.length) setLiveLogs(l.messages);
    } catch {
      setApiOnline(false);
    }
  }

  // ── TICK BLOCK + CLOCK + API REFRESH ───────
  useEffect(() => {
    setTime(new Date().toLocaleTimeString('en-GB'));
    fetchAll();
    const iv = setInterval(() => {
      setBlock(b => b + 1);
      setTime(new Date().toLocaleTimeString('en-GB'));
      fetchAll();
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  // ── MERGE LIVE DATA WITH STATIC FALLBACK ───
  const displayAgents = liveAgents.map(agent => ({
    ...AGENTS.find(a => a.name === agent.name) || {},
    ...agent,
  }));

  const kvEntries = liveMemory?.kv_entries || KV_STORE;
  const totalKeys = liveMemory?.total_keys || 270;
  const usedSpace = liveMemory?.used_space || '3.2 MB';
  const agentsOnline = liveSwarm?.active ? '3 / 3' : '3 / 3';

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }} className="grid-bg">

      {/* ═══════════════════════════════════════
          HEADER
      ═══════════════════════════════════════ */}
      <section style={{ marginBottom: '2rem' }}>
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
              { label: 'AGENTS ONLINE', value: agentsOnline, color: '#00FF88' },
              { label: 'LOCAL TIME', value: time, color: '#FFFFFF' },
              {
                label: 'API STATUS',
                value: apiOnline ? 'LIVE ●' : 'MOCK ○',
                color: apiOnline ? '#00FF88' : '#FF4500'
              },
            ].map(stat => (
              <div
                key={stat.label}
                style={{
                  border: '2px solid rgba(255,255,255,0.15)',
                  padding: '0.6rem 1rem',
                  textAlign: 'right',
                }}
              >
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.55rem',
                  letterSpacing: '0.15em',
                  color: '#555',
                  textTransform: 'uppercase',
                  marginBottom: 2,
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: stat.color,
                  letterSpacing: '0.05em',
                }}>
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
            {
              label: '0G Explorer',
              addr: '↗ chainscan-galileo.0g.ai',
              link: `https://chainscan-galileo.0g.ai/address/${CONTRACTS.AgentRegistry}`
            },
          ].map(c => (
            <div
              key={c.label}
              onClick={() => c.link && window.open(c.link, '_blank')}
              style={{
                border: '2px solid #0A0A0A',
                background: c.link ? '#00FF88' : '#FFFFFF',
                padding: '0.3rem 0.8rem',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6rem',
                display: 'flex',
                gap: 8,
                alignItems: 'center',
                cursor: c.link ? 'pointer' : 'default',
              }}
            >
              <span style={{
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                {c.label}:
              </span>
              <span style={{ color: '#666' }}>{c.addr}</span>
            </div>
          ))}

          {/* Live API indicator */}
          {apiOnline && (
            <div style={{
              border: '2px solid #00FF88',
              background: '#00FF88',
              padding: '0.3rem 0.8rem',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.6rem',
              fontWeight: 700,
              display: 'flex',
              gap: 6,
              alignItems: 'center',
            }}>
              <span style={{
                width: 6, height: 6,
                background: '#0A0A0A',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'pulse 1s infinite'
              }} />
              LIVE DATA FROM SYNAPSE SWARM
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          AGENT CARDS
      ═══════════════════════════════════════ */}
      <section style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <span style={{
            background: '#00FF88', width: 10, height: 10,
            display: 'inline-block', border: '2px solid #0A0A0A'
          }} />
          ACTIVE AGENTS
          {liveSwarm?.goal && (
            <span style={{
              marginLeft: 16,
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              color: '#666',
              fontWeight: 400,
            }}>
              CURRENT GOAL: {liveSwarm.goal}
            </span>
          )}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem',
        }}>
          {displayAgents.map((agent, i) => (
            <AgentCard key={agent.id} agent={agent} index={i} />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TERMINAL + KV STORE
      ═══════════════════════════════════════ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* AXL Terminal */}
        <div>
          <div className="section-header">
            <span style={{
              background: '#FF4500', width: 10, height: 10,
              display: 'inline-block', border: '2px solid #0A0A0A'
            }} />
            AXL P2P TERMINAL
            {liveLogs.length > 0 && (
              <span style={{
                marginLeft: 8,
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6rem',
                color: '#00FF88',
              }}>
                {liveLogs.length} LIVE MESSAGES
              </span>
            )}
          </div>
          <Terminal height={360} liveLogs={liveLogs} />
        </div>

        {/* 0G KV Store */}
        <div>
          <div className="section-header">
            <span style={{
              background: '#0066FF', width: 10, height: 10,
              display: 'inline-block', border: '2px solid #0A0A0A'
            }} />
            0G STORAGE — KEY / VALUE VIEWER
          </div>
          <div style={{
            border: '3px solid #0A0A0A',
            boxShadow: '4px 4px 0px #0A0A0A',
            overflow: 'hidden'
          }}>
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
                {kvEntries.map((kv: any) => (
                  <tr key={kv.key}>
                    <td style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.6rem',
                      color: '#00AA55',
                      padding: '0.5rem 0.75rem',
                      border: '2px solid #0A0A0A',
                      maxWidth: 180,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {kv.key}
                    </td>
                    <td style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      border: '2px solid #0A0A0A',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {kv.value}
                    </td>
                    <td style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      padding: '0.5rem 0.75rem',
                      border: '2px solid #0A0A0A',
                      color: '#0066FF',
                      whiteSpace: 'nowrap',
                    }}>
                      {kv.type}
                    </td>
                    <td style={{
                      fontFamily: "'Space Mono', monospace",
                      fontSize: '0.58rem',
                      padding: '0.5rem 0.75rem',
                      border: '2px solid #0A0A0A',
                      color: '#888',
                      whiteSpace: 'nowrap',
                    }}>
                      {kv.ttl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Storage stats */}
          <div style={{
            display: 'flex',
            gap: 0,
            marginTop: 8,
            border: '3px solid #0A0A0A',
            boxShadow: '4px 4px 0px #0A0A0A',
          }}>
            {[
              { label: 'TOTAL KEYS', value: totalKeys.toString() },
              { label: 'USED SPACE', value: usedSpace },
              { label: 'REPLICATION', value: '3×' },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex: 1,
                padding: '0.6rem',
                borderRight: i < 2 ? '2px solid #0A0A0A' : undefined,
                background: '#FFFFFF',
                textAlign: 'center',
              }}>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.55rem',
                  color: '#888',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}>
                  {s.label}
                </div>
                <div style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#0A0A0A',
                  marginTop: 2
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          KEEPERHUB TX LIST + RETRY DEMO
      ═══════════════════════════════════════ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '3fr 2fr',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div>
          <div className="section-header">
            <span style={{
              background: '#FF4500', width: 10, height: 10,
              display: 'inline-block', border: '2px solid #0A0A0A'
            }} />
            KEEPERHUB — TRANSACTION HISTORY
          </div>
          <div style={{
            border: '3px solid #0A0A0A',
            boxShadow: '4px 4px 0px #0A0A0A',
            overflowX: 'auto'
          }}>
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
                {TX_RECORDS.map(tx => (
                  <TxRow key={tx.id} tx={tx} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="section-header">
            <span style={{
              background: '#0066FF', width: 10, height: 10,
              display: 'inline-block', border: '2px solid #0A0A0A'
            }} />
            RETRY ENGINE — LIVE DEMO
          </div>
          <RetryDemo />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SWARM INFO FOOTER
      ═══════════════════════════════════════ */}
      {liveSwarm && (
        <section style={{
          border: '3px solid #0A0A0A',
          boxShadow: '4px 4px 0px #0A0A0A',
          background: '#0A0A0A',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}>
          {[
            { label: 'NETWORK', value: liveSwarm.network || '0G Galileo Testnet' },
            { label: 'SWARM STATUS', value: liveSwarm.active ? 'ACTIVE' : 'IDLE' },
            { label: 'CYCLE', value: `#${liveSwarm.cycle || 47}` },
            { label: 'AXL PEERS', value: '2 CONNECTED' },
            { label: 'KEEPERHUB', value: 'MCP ONLINE' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.5rem',
                color: '#555',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: 2,
              }}>
                {item.label}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#00FF88',
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </section>
      )}

    </div>
  );
}