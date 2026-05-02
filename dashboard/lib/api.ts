const API_BASE = 'http://localhost:8000/api'

export async function getAgents() {
    try {
        const res = await fetch(`${API_BASE}/agents`,
            { cache: 'no-store' })
        return res.json()
    } catch {
        // Return mock data if API down
        return { agents: mockAgents }
    }
}

export async function getSwarm() {
    try {
        const res = await fetch(`${API_BASE}/swarm`,
            { cache: 'no-store' })
        return res.json()
    } catch {
        return mockSwarm
    }
}

export async function getMemory() {
    try {
        const res = await fetch(`${API_BASE}/memory`,
            { cache: 'no-store' })
        return res.json()
    } catch {
        return mockMemory
    }
}

export async function getLogs() {
    try {
        const res = await fetch(`${API_BASE}/logs`,
            { cache: 'no-store' })
        return res.json()
    } catch {
        return { messages: [] }
    }
}

// Mock fallbacks
const mockAgents = [
    {
        id: 1, name: "ARIA", role: "ANALYST",
        ens: "aria.syn.eth", status: "THINKING",
        cycles: 47, confidence: 78, token_id: 1
    },
    {
        id: 2, name: "APEX", role: "EXECUTOR",
        ens: "apex.syn.eth", status: "EXECUTING",
        tx_count: 23, success_rate: 96, token_id: 2
    },
    {
        id: 3, name: "AIDEN", role: "AUDITOR",
        ens: "aiden.syn.eth", status: "APPROVED",
        audits: 31, risks: 2, token_id: 3
    }
]

const mockSwarm = {
    active: true,
    goal: "Analyze ETH/USDC opportunity",
    cycle: 47,
    network: "0G Galileo Testnet"
}

const mockMemory = {
    total_keys: 7,
    log_entries: 23,
    used_space: "3.2 KB"
}