// SYNAPSE OS — Core Data Types & Hardcoded Demo Data

export type AgentStatus = 'THINKING' | 'EXECUTING' | 'APPROVED' | 'IDLE' | 'ERROR';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  cycles: number;
  confidence?: number;
  txCount?: number;
  successRate?: number;
  audits?: number;
  risks?: number;
  ens: string;
  tokenId: number;
  color: string;
  shadowColor: string;
  peerId: string;
  memory: {
    used: number;
    total: number;
    keys: number;
  };
  logs: LogEntry[];
  peers: string[];
}

export interface LogEntry {
  ts: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  msg: string;
}

export interface TxRecord {
  id: string;
  hash: string;
  agent: string;
  action: string;
  attempt: number;
  maxAttempts: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING';
  timestamp: string;
  gas: string;
  value: string;
}

export interface KVPair {
  key: string;
  value: string;
  type: string;
  ttl: string;
}

export interface TerminalMessage {
  id: number;
  ts: string;
  from: string;
  to: string;
  type: string;
  payload: string;
  color: string;
}

// ── CONTRACT ADDRESSES ──────────────────────────────────────────────────────
export const CONTRACTS = {
  SynapseNFT: '0x435aecBd6Bf3bD6a6F270Ec8C32847b83edf5087',
  AgentRegistry: '0x48A75514c9dE15234De96B4e08101607a67eC7E8',
  network: '0G Galileo Testnet',
  chainId: '0x400',
  explorer: 'https://explorer.0g.ai',
};

// ── AGENTS ───────────────────────────────────────────────────────────────────
export const AGENTS: Agent[] = [
  {
    id: 'aria',
    name: 'ARIA',
    role: 'Reasoning Engine',
    status: 'THINKING',
    cycles: 47,
    confidence: 78,
    ens: 'aria.syn.eth',
    tokenId: 1,
    color: '#00FF88',
    shadowColor: 'rgba(0,255,136,0.5)',
    peerId: 'QmARIA1x9f3kd82nxp4hj7kl3md9x2p5n8q1z6v7w0e4r',
    memory: { used: 384, total: 512, keys: 127 },
    logs: [
      { ts: '17:02:11', level: 'INFO', msg: 'Starting reasoning cycle #47' },
      { ts: '17:02:09', level: 'DEBUG', msg: 'Loading context from 0G key: agent:aria:context' },
      { ts: '17:02:07', level: 'INFO', msg: 'Querying inference model — temperature=0.7' },
      { ts: '17:01:58', level: 'INFO', msg: 'Received task: Evaluate AIDEN risk report #31' },
      { ts: '17:01:45', level: 'DEBUG', msg: 'Syncing memory snapshot from 0G Storage' },
      { ts: '17:01:30', level: 'WARN', msg: 'Context window at 78% capacity' },
      { ts: '17:01:15', level: 'INFO', msg: 'P2P handshake with APEX confirmed' },
      { ts: '17:01:00', level: 'INFO', msg: 'Bootstrap complete — joining mesh network' },
    ],
    peers: ['apex', 'aiden'],
  },
  {
    id: 'apex',
    name: 'APEX',
    role: 'Execution Layer',
    status: 'EXECUTING',
    cycles: 23,
    txCount: 23,
    successRate: 96,
    ens: 'apex.syn.eth',
    tokenId: 2,
    color: '#FF4500',
    shadowColor: 'rgba(255,69,0,0.5)',
    peerId: 'QmAPEX2y8g4le93oyq5ij8lm4ne0y3q6o9r2a7b1f5s',
    memory: { used: 210, total: 512, keys: 89 },
    logs: [
      { ts: '17:02:13', level: 'INFO', msg: 'Submitting tx via KeeperHub workflow' },
      { ts: '17:02:10', level: 'INFO', msg: 'Gas estimate: 89,450 — proceeding' },
      { ts: '17:02:05', level: 'WARN', msg: 'Attempt 1 failed — RPC timeout, retrying…' },
      { ts: '17:02:03', level: 'INFO', msg: 'Attempt 2 — switching to fallback RPC' },
      { ts: '17:01:59', level: 'INFO', msg: 'TX SUCCESS — 0xd4e3…f7a2 confirmed' },
      { ts: '17:01:50', level: 'DEBUG', msg: 'x402 payment deducted: 0.001 ETH' },
      { ts: '17:01:40', level: 'INFO', msg: 'Writing result to 0G key: apex:tx:23' },
      { ts: '17:01:30', level: 'INFO', msg: 'Notifying ARIA via AXL P2P' },
    ],
    peers: ['aria', 'aiden'],
  },
  {
    id: 'aiden',
    name: 'AIDEN',
    role: 'Audit & Compliance',
    status: 'APPROVED',
    cycles: 31,
    audits: 31,
    risks: 2,
    ens: 'aiden.syn.eth',
    tokenId: 3,
    color: '#0066FF',
    shadowColor: 'rgba(0,102,255,0.5)',
    peerId: 'QmAIDEN3z5h5mf04pzr6jk5on5pf1r7p0s3c8d2g6t',
    memory: { used: 156, total: 512, keys: 54 },
    logs: [
      { ts: '17:02:12', level: 'INFO', msg: 'Audit cycle #31 complete — APPROVED' },
      { ts: '17:02:08', level: 'WARN', msg: 'Risk flag: reentrancy pattern in contract ABI' },
      { ts: '17:02:04', level: 'INFO', msg: 'Publishing risk report to 0G Storage' },
      { ts: '17:01:55', level: 'DEBUG', msg: 'Scanning 4 contract interactions' },
      { ts: '17:01:48', level: 'INFO', msg: 'Verified iNFT ownership — tokenId #3' },
      { ts: '17:01:40', level: 'WARN', msg: 'Risk flag: high gas volatility detected' },
      { ts: '17:01:30', level: 'INFO', msg: 'Compliance check started for APEX tx batch' },
      { ts: '17:01:20', level: 'DEBUG', msg: 'Fetching ENS: aiden.syn.eth — resolved' },
    ],
    peers: ['aria', 'apex'],
  },
];

// ── KV STORE ─────────────────────────────────────────────────────────────────
export const KV_STORE: KVPair[] = [
  { key: 'agent:aria:context',   value: '{"cycle":47,"model":"gpt-4o","temp":0.7}', type: 'JSON', ttl: '∞' },
  { key: 'agent:aria:memory',    value: '384 KB / 512 KB used',                      type: 'BLOB', ttl: '∞' },
  { key: 'agent:apex:tx:23',     value: '0xd4e3...f7a2 — CONFIRMED',                 type: 'STR',  ttl: '3600s' },
  { key: 'agent:apex:status',    value: 'EXECUTING',                                  type: 'STR',  ttl: '60s' },
  { key: 'agent:aiden:report:31',value: '{"status":"APPROVED","risks":2}',            type: 'JSON', ttl: '∞' },
  { key: 'synapse:mesh:peers',   value: '["aria","apex","aiden"]',                    type: 'ARR',  ttl: '∞' },
  { key: 'synapse:block:latest', value: '4182847',                                    type: 'NUM',  ttl: '12s' },
  { key: 'synapse:gas:estimate', value: '89450',                                      type: 'NUM',  ttl: '15s' },
];

// ── TERMINAL MESSAGES ────────────────────────────────────────────────────────
export const TERMINAL_MESSAGES: TerminalMessage[] = [
  { id: 1,  ts: '17:02:14', from: 'APEX',  to: 'ARIA',  type: 'RESULT',    payload: 'tx:23 confirmed — hash=0xd4e3f7a2', color: '#FF4500' },
  { id: 2,  ts: '17:02:13', from: 'ARIA',  to: 'APEX',  type: 'TASK',      payload: 'execute contract call — AgentRegistry.cycle()', color: '#00FF88' },
  { id: 3,  ts: '17:02:11', from: 'AIDEN', to: 'ARIA',  type: 'AUDIT',     payload: 'risk_report_31 approved — risks=2', color: '#0066FF' },
  { id: 4,  ts: '17:02:09', from: 'ARIA',  to: 'AIDEN', type: 'REQUEST',   payload: 'audit tx batch [21,22,23] before submission', color: '#00FF88' },
  { id: 5,  ts: '17:02:07', from: 'APEX',  to: 'AIDEN', type: 'NOTIFY',    payload: 'new tx batch ready — 3 interactions', color: '#FF4500' },
  { id: 6,  ts: '17:02:05', from: 'AIDEN', to: 'APEX',  type: 'WARN',      payload: 'reentrancy flag detected — proceed with caution', color: '#0066FF' },
  { id: 7,  ts: '17:02:03', from: 'ARIA',  to: 'APEX',  type: 'TASK',      payload: 'retry tx:22 on fallback RPC', color: '#00FF88' },
  { id: 8,  ts: '17:02:01', from: 'APEX',  to: 'ARIA',  type: 'ERROR',     payload: 'tx:22 attempt_1 failed — RPC timeout', color: '#FF4500' },
  { id: 9,  ts: '17:01:58', from: 'ARIA',  to: 'AIDEN', type: 'TASK',      payload: 'begin compliance check cycle #31', color: '#00FF88' },
  { id: 10, ts: '17:01:55', from: 'AIDEN', to: 'ARIA',  type: 'STATUS',    payload: 'memory snapshot synced — 54 keys loaded', color: '#0066FF' },
];

// ── TX RECORDS ────────────────────────────────────────────────────────────────
export const TX_RECORDS: TxRecord[] = [
  { id: 'tx-23', hash: '0xd4e3...f7a2', agent: 'APEX', action: 'AgentRegistry.cycle()',    attempt: 1, maxAttempts: 3, status: 'SUCCESS', timestamp: '17:02:00', gas: '89,450', value: '0.001 ETH' },
  { id: 'tx-22', hash: '0xc1b2...e5d1', agent: 'APEX', action: 'SynapseNFT.mint()',        attempt: 2, maxAttempts: 3, status: 'SUCCESS', timestamp: '17:01:30', gas: '142,000', value: '0.005 ETH' },
  { id: 'tx-21', hash: '0xf9a8...3c4b', agent: 'APEX', action: 'AgentRegistry.register()',attempt: 1, maxAttempts: 3, status: 'SUCCESS', timestamp: '17:01:00', gas: '67,800', value: '0 ETH' },
  { id: 'tx-20', hash: '0xb7d5...9e6f', agent: 'APEX', action: 'SynapseNFT.transfer()',   attempt: 3, maxAttempts: 3, status: 'SUCCESS', timestamp: '17:00:20', gas: '55,200', value: '0 ETH' },
  { id: 'tx-19', hash: '0xe2c4...8a1d', agent: 'APEX', action: 'AgentRegistry.cycle()',   attempt: 1, maxAttempts: 3, status: 'FAILED',  timestamp: '16:59:50', gas: '—', value: '0 ETH' },
];
