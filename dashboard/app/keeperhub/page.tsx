'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TX_RECORDS, CONTRACTS } from '@/lib/data';
import TxRow from '@/components/TxRow';
import RetryDemo from '@/components/RetryDemo';

const WORKFLOW_STEPS = [
  { id: 'trigger',  label: 'TRIGGER',    desc: 'Agent emits execute() signal', status: 'DONE',    color: '#00FF88' },
  { id: 'validate', label: 'VALIDATE',   desc: 'AIDEN audits the action',       status: 'DONE',    color: '#00FF88' },
  { id: 'submit',   label: 'SUBMIT TX',  desc: 'APEX calls KeeperHub API',      status: 'DONE',    color: '#00FF88' },
  { id: 'retry',    label: 'RETRY ENG',  desc: 'Retry on RPC failure',          status: 'ACTIVE',  color: '#FF4500' },
  { id: 'confirm',  label: 'CONFIRM',    desc: '0G block confirmation',         status: 'PENDING', color: '#888' },
  { id: 'x402',     label: 'x402 PAY',   desc: 'Payment deducted from wallet',  status: 'PENDING', color: '#888' },
];

const X402_STATUS = [
  { label: 'PROTOCOL',      value: 'x402 HTTP Payment' },
  { label: 'PAYMENT AGENT', value: 'APEX' },
  { label: 'AMOUNT',        value: '0.001 ETH / request' },
  { label: 'WALLET',        value: '0xAPEX…faucet' },
  { label: 'TX #23 STATUS', value: 'DEDUCTED' },
  { label: 'TOTAL SPENT',   value: '0.023 ETH' },
  { label: 'BALANCE',       value: '1.977 ETH' },
];

export default function KeeperHubPage() {
  const [selectedTx, setSelectedTx] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem 1.5rem' }} className="grid-bg">

      {/* ── HEADER ── */}
      <div
        style={{
          border: '3px solid #0A0A0A',
          boxShadow: '6px 6px 0px #FF4500',
          background: '#0A0A0A',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
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
              color: '#FF4500',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}
          >
            KEEPERHUB
          </h1>
          <p style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.65rem', letterSpacing: '0.15em', color: '#555', textTransform: 'uppercase' }}>
            AUTONOMOUS TX EXECUTION ENGINE · RETRY · x402 PAYMENTS
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'TOTAL TX', value: '23',  color: '#FF4500' },
            { label: 'SUCCESS',  value: '22',  color: '#00FF88' },
            { label: 'FAILED',   value: '1',   color: '#CC0000' },
            { label: 'SUCCESS %', value: '96%', color: '#00FF88' },
          ].map(s => (
            <div key={s.label} style={{ border: `2px solid ${s.color}`, padding: '0.5rem 1rem', textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.55rem', color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── WORKFLOW PIPELINE ── */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <span style={{ background: '#FF4500', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
          EXECUTION PIPELINE — WORKFLOW STATUS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0, border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A' }}>
          {WORKFLOW_STEPS.map((step, i) => (
            <div
              key={step.id}
              style={{
                borderRight: i < WORKFLOW_STEPS.length - 1 ? '3px solid #0A0A0A' : undefined,
                background: step.status === 'DONE' ? step.color : step.status === 'ACTIVE' ? '#0A0A0A' : '#FFFFFF',
                padding: '1.25rem 1rem',
                position: 'relative',
              }}
            >
              {/* Step number */}
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.55rem',
                  letterSpacing: '0.15em',
                  color: step.status === 'DONE' ? '#0A0A0A' : step.status === 'ACTIVE' ? '#FF4500' : '#888',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                STEP {String(i + 1).padStart(2, '0')}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: step.status === 'DONE' ? '#0A0A0A' : step.status === 'ACTIVE' ? '#FF4500' : '#0A0A0A',
                  marginBottom: 6,
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.58rem',
                  color: step.status === 'DONE' ? 'rgba(10,10,10,0.7)' : step.status === 'ACTIVE' ? '#888' : '#888',
                  lineHeight: 1.4,
                  marginBottom: 8,
                }}
              >
                {step.desc}
              </div>
              {/* Status chip */}
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.55rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  background: step.status === 'DONE'
                    ? '#0A0A0A'
                    : step.status === 'ACTIVE'
                    ? '#FF4500'
                    : '#E0D8C8',
                  color: step.status === 'DONE'
                    ? '#00FF88'
                    : step.status === 'ACTIVE'
                    ? '#FFFFFF'
                    : '#888',
                  padding: '2px 8px',
                  border: '2px solid #0A0A0A',
                }}
              >
                {step.status === 'DONE' ? '✓ DONE' : step.status === 'ACTIVE' ? '▶ ACTIVE' : '○ PENDING'}
              </span>

              {/* Arrow connector */}
              {i < WORKFLOW_STEPS.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    right: -14,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#0A0A0A',
                    zIndex: 2,
                    background: step.status === 'DONE' ? step.color : '#FFFFFF',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #0A0A0A',
                  }}
                >
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TX TABLE + RETRY DEMO ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* TX Table */}
        <div>
          <div className="section-header">
            <span style={{ background: '#00FF88', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            TRANSACTION HISTORY
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
            <span style={{ background: '#FF4500', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
            RETRY ENGINE — ATTEMPT 1 FAIL → ATTEMPT 2 SUCCESS
          </div>
          <RetryDemo />
        </div>
      </div>

      {/* ── x402 PAYMENT STATUS ── */}
      <div>
        <div className="section-header">
          <span style={{ background: '#0066FF', width: 10, height: 10, display: 'inline-block', border: '2px solid #0A0A0A' }} />
          x402 PAYMENT PROTOCOL STATUS
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
          }}
        >
          {/* x402 Info */}
          <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0066FF', background: '#FFFFFF', padding: '1.5rem' }}>
            {X402_STATUS.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0',
                  borderBottom: i < X402_STATUS.length - 1 ? '2px solid #0A0A0A' : undefined,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                }}
              >
                <span style={{ color: '#666', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{row.label}</span>
                <span style={{ fontWeight: 700, color: '#0A0A0A' }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* x402 Flow Diagram */}
          <div style={{ border: '3px solid #0A0A0A', boxShadow: '4px 4px 0px #0A0A0A', background: '#0A0A0A', padding: '1.5rem' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '0.6rem', color: '#555', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              PAYMENT FLOW
            </div>
            {[
              { label: 'APEX AGENT', color: '#FF4500', arrow: true },
              { label: 'x402 HTTP HEADER', color: '#888', arrow: true },
              { label: 'KEEPERHUB API', color: '#0066FF', arrow: true },
              { label: '0G GALILEO TX', color: '#00FF88', arrow: false },
            ].map((item, i) => (
              <div key={item.label}>
                <div
                  style={{
                    border: `3px solid ${item.color}`,
                    padding: '0.6rem 1rem',
                    fontFamily: "'Space Mono', monospace",
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: item.color,
                    textTransform: 'uppercase',
                    background: 'transparent',
                  }}
                >
                  {item.label}
                </div>
                {item.arrow && (
                  <div style={{ textAlign: 'center', color: '#555', fontFamily: "'Space Mono', monospace", fontSize: '1rem', padding: '4px 0' }}>↓</div>
                )}
              </div>
            ))}
            <div
              style={{
                marginTop: '1rem',
                border: '3px solid #00FF88',
                boxShadow: '4px 4px 0px #00FF88',
                padding: '0.75rem',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.65rem',
                fontWeight: 700,
                color: '#00FF88',
                textAlign: 'center',
                letterSpacing: '0.1em',
              }}
            >
              ✓ PAYMENT SETTLED · 0.001 ETH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
