'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RetryStep {
  attempt: number;
  status: 'PENDING' | 'FAIL' | 'SUCCESS' | 'RUNNING';
  label: string;
  detail: string;
  color: string;
  textColor: string;
}

const RETRY_SEQUENCE: RetryStep[] = [
  { attempt: 1, status: 'PENDING', label: 'ATTEMPT 1',  detail: 'Primary RPC · gas=89,450',    color: '#E0D8C8', textColor: '#0A0A0A' },
  { attempt: 2, status: 'PENDING', label: 'ATTEMPT 2',  detail: 'Fallback RPC · gas=87,200',   color: '#E0D8C8', textColor: '#0A0A0A' },
];

export default function RetryDemo() {
  const [steps, setSteps] = useState<RetryStep[]>(RETRY_SEQUENCE);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const runDemo = () => {
    if (phase === 'running') return;
    setPhase('running');
    setSteps(RETRY_SEQUENCE.map(s => ({ ...s, status: 'PENDING' })));
    setActiveStep(null);

    // Step 1: attempt 1 → RUNNING
    setTimeout(() => {
      setActiveStep(0);
      setSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'RUNNING' } : s));
    }, 400);

    // Step 1: attempt 1 → FAIL
    setTimeout(() => {
      setSteps(prev => prev.map((s, i) =>
        i === 0 ? { ...s, status: 'FAIL', color: '#FF4500', textColor: '#FFFFFF', detail: 'RPC timeout · 0x0000 reverted' } : s
      ));
    }, 1600);

    // Step 2: attempt 2 → RUNNING
    setTimeout(() => {
      setActiveStep(1);
      setSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'RUNNING' } : s));
    }, 2400);

    // Step 2: attempt 2 → SUCCESS
    setTimeout(() => {
      setSteps(prev => prev.map((s, i) =>
        i === 1 ? { ...s, status: 'SUCCESS', color: '#00FF88', textColor: '#0A0A0A', detail: '0xd4e3…f7a2 CONFIRMED' } : s
      ));
      setPhase('done');
      setActiveStep(null);
    }, 3800);
  };

  // Auto-loop
  useEffect(() => {
    runDemo();
    const iv = setInterval(() => {
      setPhase('idle');
      setTimeout(runDemo, 300);
    }, 8000);
    return () => clearInterval(iv);
  }, []); // eslint-disable-line

  const statusIcon = (s: RetryStep['status']) => {
    if (s === 'PENDING') return '○';
    if (s === 'RUNNING') return '◉';
    if (s === 'FAIL')    return '✕';
    if (s === 'SUCCESS') return '✓';
    return '○';
  };

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.attempt}
            animate={{
              x: activeStep === i ? [-4, 0] : 0,
              scale: step.status === 'RUNNING' ? 1.01 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300 }}
            style={{
              border: `3px solid #0A0A0A`,
              boxShadow: step.status === 'SUCCESS'
                ? '4px 4px 0px #00FF88'
                : step.status === 'FAIL'
                ? '4px 4px 0px #FF4500'
                : step.status === 'RUNNING'
                ? '4px 4px 0px #0066FF'
                : '4px 4px 0px #0A0A0A',
              background: step.color,
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'background 0.3s, box-shadow 0.3s, color 0.3s',
            }}
          >
            {/* Status icon */}
            <motion.span
              animate={{ rotate: step.status === 'RUNNING' ? 360 : 0 }}
              transition={{ duration: 1, repeat: step.status === 'RUNNING' ? Infinity : 0, ease: 'linear' }}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '1.5rem',
                fontWeight: 700,
                color: step.status === 'RUNNING' ? '#0066FF' : step.textColor,
                width: 28,
                textAlign: 'center',
                flexShrink: 0,
              }}
            >
              {statusIcon(step.status)}
            </motion.span>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  color: step.textColor,
                  textTransform: 'uppercase',
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.65rem',
                  color: step.textColor,
                  opacity: 0.8,
                  marginTop: 2,
                }}
              >
                {step.detail}
              </div>
            </div>

            {/* Status chip */}
            <AnimatePresence mode="wait">
              <motion.span
                key={step.status}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  background: '#0A0A0A',
                  color: step.status === 'SUCCESS' ? '#00FF88' :
                         step.status === 'FAIL'    ? '#FF4500' :
                         step.status === 'RUNNING' ? '#0066FF' :
                         '#888',
                  padding: '3px 10px',
                  border: '2px solid rgba(255,255,255,0.2)',
                  flexShrink: 0,
                }}
              >
                {step.status}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Arrow connector */}
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: '#666',
          textAlign: 'center',
          padding: '0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        <div style={{ flex: 1, height: 2, background: '#0A0A0A' }} />
        <span>KEEPERHUB RETRY ENGINE · MAX 3 ATTEMPTS</span>
        <div style={{ flex: 1, height: 2, background: '#0A0A0A' }} />
      </div>

      {/* Result */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: '#00FF88',
              border: '3px solid #0A0A0A',
              boxShadow: '4px 4px 0px #0A0A0A',
              padding: '0.75rem 1.25rem',
              fontFamily: "'Space Mono', monospace",
              fontWeight: 700,
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textAlign: 'center',
              color: '#0A0A0A',
              textTransform: 'uppercase',
            }}
          >
            ✓ TX CONFIRMED · x402 PAYMENT PROCESSED · 0.001 ETH DEDUCTED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
