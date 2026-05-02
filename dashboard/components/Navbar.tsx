'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { CONTRACTS } from '@/lib/data';

const NAV_LINKS = [
  { href: '/',           label: 'DASHBOARD' },
  { href: '/agents',     label: 'AGENTS' },
  { href: '/network',    label: 'NETWORK' },
  { href: '/keeperhub',  label: 'KEEPERHUB' },
];

interface Notification {
  id: number;
  msg: string;
  color: string;
}

const NOTIF_POOL = [
  { msg: 'ARIA completed reasoning cycle #47', color: '#00FF88' },
  { msg: 'APEX tx:23 confirmed on 0G Galileo', color: '#FF4500' },
  { msg: 'AIDEN approved audit report #31', color: '#0066FF' },
  { msg: 'Mesh network: all 3 peers connected', color: '#00FF88' },
  { msg: 'KeeperHub retry engine: 96% success rate', color: '#FF4500' },
  { msg: '0G Storage: 270 keys synced across agents', color: '#0066FF' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [notifId, setNotifId] = useState(0);

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      const n = { id: notifId + idx, ...NOTIF_POOL[idx % NOTIF_POOL.length] };
      idx++;
      setNotifId(i => i + 1);
      setNotifs(prev => [...prev, n]);
      setTimeout(() => {
        setNotifs(prev => prev.filter(x => x.id !== n.id));
      }, 5000);
    }, 8000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  return (
    <>
      {/* ── NAV BAR ── */}
      <nav
        style={{
          borderBottom: '3px solid #0A0A0A',
          background: '#0A0A0A',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
          }}
        >
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  background: '#00FF88',
                  display: 'inline-block',
                  border: '2px solid #00FF88',
                  animation: 'pulse-green 1.5s infinite',
                }}
              />
              <span
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  letterSpacing: '0.15em',
                  color: '#FFFFFF',
                }}
              >
                SYNAPSE<span style={{ color: '#00FF88' }}>_OS</span>
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 4 }}>
            {NAV_LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? ' active' : ''}`}
                style={{ color: pathname === l.href ? '#0A0A0A' : '#FFFFFF',
                         background: pathname === l.href ? '#00FF88' : 'transparent',
                         borderColor: pathname === l.href ? '#00FF88' : 'transparent' }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Network chip */}
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              color: '#0A0A0A',
              background: '#00FF88',
              border: '2px solid #00FF88',
              padding: '2px 10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ width: 6, height: 6, background: '#0A0A0A', display: 'inline-block' }} />
            {CONTRACTS.network}
          </div>
        </div>
      </nav>

      {/* ── NOTIFICATIONS ── */}
      <div
        style={{
          position: 'fixed',
          top: 72,
          right: 20,
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {notifs.map(n => (
            <motion.div
              key={n.id}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                background: '#0A0A0A',
                color: n.color,
                border: `3px solid ${n.color}`,
                boxShadow: `4px 4px 0px ${n.color}`,
                padding: '0.6rem 1rem',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.68rem',
                fontWeight: 700,
                maxWidth: 320,
                letterSpacing: '0.04em',
              }}
            >
              <span style={{ color: n.color, marginRight: 6 }}>▶</span>
              {n.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
