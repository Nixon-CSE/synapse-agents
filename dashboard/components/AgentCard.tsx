'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Agent } from '@/lib/data';
import StatusBadge from './StatusBadge';

interface Props {
  agent: Agent;
  index?: number;
}

export default function AgentCard({ agent, index = 0 }: Props) {
  const metricLabel =
    agent.id === 'aria' ? 'CONFIDENCE' :
    agent.id === 'apex' ? 'SUCCESS RATE' :
    'AUDITS DONE';

  const metricValue =
    agent.id === 'aria' ? `${agent.confidence}%` :
    agent.id === 'apex' ? `${agent.successRate}%` :
    `${agent.audits}`;

  const progressValue =
    agent.id === 'aria' ? agent.confidence! :
    agent.id === 'apex' ? agent.successRate! :
    Math.round((agent.audits! / 40) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ x: -2, y: -2 }}
      style={{
        border: '3px solid #0A0A0A',
        boxShadow: `4px 4px 0px #0A0A0A`,
        background: '#FFFFFF',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.12s ease, transform 0.12s ease',
      }}
      className="group"
    >
      {/* Color accent bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: agent.color,
          borderBottom: '2px solid #0A0A0A',
        }}
      />

      {/* Top row: name + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6 }}>
        <div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '1.8rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              color: '#0A0A0A',
            }}
          >
            {agent.name}
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              color: '#666',
              textTransform: 'uppercase',
              marginTop: 4,
            }}
          >
            {agent.role}
          </div>
        </div>
        <StatusBadge status={agent.status} />
      </div>

      {/* iNFT + ENS */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            background: '#0A0A0A',
            color: '#FFFFFF',
            padding: '2px 8px',
            textTransform: 'uppercase',
          }}
        >
          iNFT #{agent.tokenId}
        </span>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            letterSpacing: '0.06em',
            color: '#0A0A0A',
            border: '2px solid #0A0A0A',
            padding: '2px 8px',
          }}
        >
          {agent.ens}
        </span>
      </div>

      {/* Cycle counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.6rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#666',
          }}
        >
          CYCLES
        </span>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '2rem',
            fontWeight: 700,
            color: agent.color,
            textShadow: `2px 2px 0px #0A0A0A`,
            lineHeight: 1,
          }}
        >
          {agent.cycles}
        </span>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
            color: '#0A0A0A',
          }}
        >
          <span>{metricLabel}</span>
          <span style={{ fontWeight: 700 }}>{metricValue}</span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressValue}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
            style={{ background: agent.color, borderRight: '2px solid #0A0A0A' }}
          />
          {/* Chunky tick marks */}
          {[25, 50, 75].map(tick => (
            <div
              key={tick}
              style={{
                position: 'absolute',
                left: `${tick}%`,
                top: 0,
                bottom: 0,
                width: 2,
                background: 'rgba(10,10,10,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Memory bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
            color: '#0A0A0A',
          }}
        >
          <span>MEM</span>
          <span style={{ fontWeight: 700 }}>{agent.memory.used}/{agent.memory.total} KB</span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(agent.memory.used / agent.memory.total) * 100}%` }}
            transition={{ delay: index * 0.1 + 0.4, duration: 0.8, ease: 'easeOut' }}
            style={{
              background: `repeating-linear-gradient(
                90deg,
                ${agent.color} 0px,
                ${agent.color} 6px,
                rgba(10,10,10,0.15) 6px,
                rgba(10,10,10,0.15) 8px
              )`,
              borderRight: '2px solid #0A0A0A',
            }}
          />
        </div>
      </div>

      {/* View button */}
      <Link
        href={`/agents/${agent.id}`}
        className="btn"
        style={{
          background: agent.color,
          color: agent.id === 'aria' ? '#0A0A0A' : '#FFFFFF',
          justifyContent: 'center',
          marginTop: 4,
        }}
      >
        VIEW AGENT →
      </Link>
    </motion.div>
  );
}
