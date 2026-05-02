'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '@/lib/data';

const NODES = [
  { id: 'aria',  label: 'ARIA',  color: '#00FF88', x: 50,  y: 20  },
  { id: 'apex',  label: 'APEX',  color: '#FF4500', x: 10,  y: 80  },
  { id: 'aiden', label: 'AIDEN', color: '#0066FF', x: 90,  y: 80  },
];

const EDGES = [
  { from: 'aria', to: 'apex'  },
  { from: 'aria', to: 'aiden' },
  { from: 'apex', to: 'aiden' },
];

// Packet that travels along an edge
interface Packet {
  id: number;
  from: string;
  to: string;
  progress: number; // 0→1
  color: string;
}

export default function NetworkGraph() {
  const [msgCount, setMsgCount] = useState(47);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [packetId, setPacketId] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  // Spawn packets periodically
  useEffect(() => {
    const iv = setInterval(() => {
      const edge = EDGES[Math.floor(Math.random() * EDGES.length)];
      const reversed = Math.random() > 0.5;
      const from = reversed ? edge.to : edge.from;
      const to   = reversed ? edge.from : edge.to;
      const srcNode = NODES.find(n => n.id === from)!;
      const newPkt: Packet = {
        id: packetId + Date.now(),
        from,
        to,
        progress: 0,
        color: srcNode.color,
      };
      setPacketId(p => p + 1);
      setPackets(prev => [...prev, newPkt]);
      setMsgCount(c => c + 1);
    }, 1200);
    return () => clearInterval(iv);
  }, [packetId]);

  // Animate packets
  useEffect(() => {
    const frame = setInterval(() => {
      setPackets(prev =>
        prev
          .map(p => ({ ...p, progress: p.progress + 0.025 }))
          .filter(p => p.progress <= 1.05)
      );
    }, 30);
    return () => clearInterval(frame);
  }, []);

  // Calculate screen coords from percentage (for a 500×400 viewBox)
  const vw = 500, vh = 400;
  const coord = (node: typeof NODES[0]) => ({
    x: (node.x / 100) * vw,
    y: (node.y / 100) * vh,
  });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${vw} ${vh}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Background grid dots */}
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 16 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={(col / 15) * vw}
              cy={(row / 11) * vh}
              r={1.5}
              fill="rgba(10,10,10,0.1)"
            />
          ))
        )}

        {/* Edges (animated dashes) */}
        {EDGES.map(edge => {
          const src = NODES.find(n => n.id === edge.from)!;
          const dst = NODES.find(n => n.id === edge.to)!;
          const s = coord(src), d = coord(dst);
          return (
            <g key={`${edge.from}-${edge.to}`}>
              {/* Base line */}
              <line
                x1={s.x} y1={s.y}
                x2={d.x} y2={d.y}
                stroke="#0A0A0A"
                strokeWidth={3}
                strokeDasharray="8 5"
                strokeLinecap="square"
              />
              {/* Animated overlay */}
              <line
                x1={s.x} y1={s.y}
                x2={d.x} y2={d.y}
                stroke="rgba(0,255,136,0.3)"
                strokeWidth={5}
                strokeDasharray="16 80"
                strokeLinecap="square"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-96"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </line>
            </g>
          );
        })}

        {/* Packets */}
        {packets.map(pkt => {
          const src = NODES.find(n => n.id === pkt.from)!;
          const dst = NODES.find(n => n.id === pkt.to)!;
          const s = coord(src), d = coord(dst);
          const px = lerp(s.x, d.x, pkt.progress);
          const py = lerp(s.y, d.y, pkt.progress);
          return (
            <g key={pkt.id}>
              <rect
                x={px - 7} y={py - 5}
                width={14} height={10}
                fill={pkt.color}
                stroke="#0A0A0A"
                strokeWidth={2}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map(node => {
          const c = coord(node);
          const nodeSize = 64;
          const agent = AGENTS.find(a => a.id === node.id)!;
          return (
            <g key={node.id}>
              {/* Shadow */}
              <rect
                x={c.x - nodeSize / 2 + 5}
                y={c.y - nodeSize / 2 + 5}
                width={nodeSize}
                height={nodeSize}
                fill="#0A0A0A"
              />
              {/* Node box */}
              <rect
                x={c.x - nodeSize / 2}
                y={c.y - nodeSize / 2}
                width={nodeSize}
                height={nodeSize}
                fill={node.color}
                stroke="#0A0A0A"
                strokeWidth={3}
              />
              {/* Name */}
              <text
                x={c.x}
                y={c.y + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Space Mono', monospace"
                fontSize={13}
                fontWeight="700"
                fill="#0A0A0A"
              >
                {node.label}
              </text>
              {/* Status dot */}
              <circle
                cx={c.x + nodeSize / 2 - 8}
                cy={c.y - nodeSize / 2 + 8}
                r={5}
                fill={agent.status === 'APPROVED' ? '#FFFFFF' : '#0A0A0A'}
                stroke="#0A0A0A"
                strokeWidth={2}
              />
              {/* Peer ID under box */}
              <text
                x={c.x}
                y={c.y + nodeSize / 2 + 16}
                textAnchor="middle"
                fontFamily="'Space Mono', monospace"
                fontSize={7}
                fill="#666"
              >
                {agent.peerId.slice(0, 20)}…
              </text>
            </g>
          );
        })}
      </svg>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 0,
          borderTop: '3px solid #0A0A0A',
          marginTop: 8,
        }}
      >
        {[
          { label: 'MESSAGES', value: msgCount.toString() },
          { label: 'PEERS',    value: '3 / 3' },
          { label: 'LATENCY',  value: '12ms' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: '0.75rem',
              borderRight: i < 2 ? '3px solid #0A0A0A' : undefined,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#666',
                marginBottom: 4,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0A0A0A',
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
