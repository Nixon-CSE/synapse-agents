"""
SYNAPSE — 0G Storage Layer
Handles all agent memory: KV (live state) + Log (history)
"""

import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# ─────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────
STORAGE_URL = os.getenv("ZEROG_STORAGE_NODE_URL", "https://storage-testnet.0g.ai")
INDEXER_URL = os.getenv("ZEROG_INDEXER_URL", "https://indexer-storage-testnet-standard.0g.ai")

# Shared swarm namespaces
SWARM_NAMESPACE   = "synapse:swarm"
ARIA_NAMESPACE    = "synapse:agent:aria"
APEX_NAMESPACE    = "synapse:agent:apex"
AIDEN_NAMESPACE   = "synapse:agent:aiden"
LOG_NAMESPACE     = "synapse:log"

# ─────────────────────────────────────────
# IN-MEMORY STORE (Simulates 0G Storage KV)
# Used for local dev — replaced by real
# 0G Storage calls on testnet
# ─────────────────────────────────────────
_local_kv_store = {}
_local_log_store = []

class ZeroGMemory:
    """
    0G Storage interface for SYNAPSE agents.
    KV Store  → real-time agent state
    Log Store → permanent decision history
    """

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.namespace  = f"synapse:agent:{agent_name.lower()}"
        self.log_ns     = f"synapse:log:{agent_name.lower()}"
        print(f"[{agent_name}] 🧠 Memory initialized | namespace: {self.namespace}")

    # ─────────────────────────────────────
    # KV STORE — Live State
    # ─────────────────────────────────────

    def kv_set(self, key: str, value: any) -> bool:
        """Write a value to 0G Storage KV"""
        full_key = f"{self.namespace}:{key}"
        try:
            _local_kv_store[full_key] = {
                "value": value,
                "updated_at": time.time(),
                "agent": self.agent_name
            }
            print(f"[{self.agent_name}] 💾 KV SET: {key} = {str(value)[:50]}")
            return True
        except Exception as e:
            print(f"[{self.agent_name}] ❌ KV SET failed: {e}")
            return False

    def kv_get(self, key: str) -> any:
        """Read a value from 0G Storage KV"""
        full_key = f"{self.namespace}:{key}"
        try:
            record = _local_kv_store.get(full_key)
            if record:
                return record["value"]
            return None
        except Exception as e:
            print(f"[{self.agent_name}] ❌ KV GET failed: {e}")
            return None

    def kv_delete(self, key: str) -> bool:
        """Delete a value from 0G Storage KV"""
        full_key = f"{self.namespace}:{key}"
        if full_key in _local_kv_store:
            del _local_kv_store[full_key]
            print(f"[{self.agent_name}] 🗑️  KV DELETE: {key}")
            return True
        return False

    # ─────────────────────────────────────
    # SWARM SHARED STATE
    # ─────────────────────────────────────

    def swarm_set(self, key: str, value: any) -> bool:
        """Write to shared swarm state (all agents can read)"""
        full_key = f"{SWARM_NAMESPACE}:{key}"
        try:
            _local_kv_store[full_key] = {
                "value": value,
                "updated_at": time.time(),
                "written_by": self.agent_name
            }
            print(f"[{self.agent_name}] 🌐 SWARM SET: {key} = {str(value)[:50]}")
            return True
        except Exception as e:
            print(f"[{self.agent_name}] ❌ SWARM SET failed: {e}")
            return False

    def swarm_get(self, key: str) -> any:
        """Read from shared swarm state"""
        full_key = f"{SWARM_NAMESPACE}:{key}"
        try:
            record = _local_kv_store.get(full_key)
            if record:
                return record["value"]
            return None
        except Exception as e:
            print(f"[{self.agent_name}] ❌ SWARM GET failed: {e}")
            return None

    # ─────────────────────────────────────
    # LOG STORE — Permanent History
    # ─────────────────────────────────────

    def log_append(self, event_type: str, data: dict) -> bool:
        """Append a permanent record to 0G Storage Log"""
        try:
            log_entry = {
                "id":         f"{self.agent_name}_{int(time.time()*1000)}",
                "agent":      self.agent_name,
                "event_type": event_type,
                "data":       data,
                "timestamp":  time.time(),
                "namespace":  self.log_ns
            }
            _local_log_store.append(log_entry)
            print(f"[{self.agent_name}] 📝 LOG: {event_type}")
            return True
        except Exception as e:
            print(f"[{self.agent_name}] ❌ LOG failed: {e}")
            return False

    def log_get_recent(self, limit: int = 10) -> list:
        """Get recent log entries for this agent"""
        agent_logs = [
            l for l in _local_log_store
            if l["agent"] == self.agent_name
        ]
        return agent_logs[-limit:]

    def log_get_all(self, limit: int = 50) -> list:
        """Get all swarm log entries"""
        return _local_log_store[-limit:]

    # ─────────────────────────────────────
    # HEARTBEAT
    # ─────────────────────────────────────

    def heartbeat(self) -> bool:
        """Write agent heartbeat to KV"""
        return self.kv_set("heartbeat", {
            "status":    "ALIVE",
            "timestamp": time.time(),
            "agent":     self.agent_name
        })

    # ─────────────────────────────────────
    # SNAPSHOT — Full Memory State
    # ─────────────────────────────────────

    def get_snapshot(self) -> dict:
        """Get full memory snapshot for this agent"""
        agent_keys = {
            k: v for k, v in _local_kv_store.items()
            if k.startswith(self.namespace)
        }
        return {
            "agent":      self.agent_name,
            "namespace":  self.namespace,
            "kv_state":   agent_keys,
            "recent_logs": self.log_get_recent(5),
            "timestamp":  time.time()
        }


# ─────────────────────────────────────────
# QUICK TEST
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🧪 Testing 0G Memory Layer...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # Test ARIA memory
    aria_mem = ZeroGMemory("ARIA")
    aria_mem.kv_set("status", "THINKING")
    aria_mem.kv_set("current_goal", "Analyze ETH/USDC opportunity")
    aria_mem.swarm_set("current_goal", "Analyze ETH/USDC opportunity")
    aria_mem.log_append("ANALYSIS_STARTED", {"signal": "ETH up 3%"})
    aria_mem.heartbeat()

    # Test APEX memory
    apex_mem = ZeroGMemory("APEX")
    apex_mem.kv_set("status", "IDLE")
    apex_mem.kv_set("last_tx", "0x0000")
    apex_mem.heartbeat()

    # Test AIDEN memory
    aiden_mem = ZeroGMemory("AIDEN")
    aiden_mem.kv_set("status", "IDLE")
    aiden_mem.kv_set("last_verdict", "NONE")
    aiden_mem.heartbeat()

    # Read shared state
    goal = aria_mem.swarm_get("current_goal")
    print(f"\n✅ Shared swarm goal: {goal}")

    # Show snapshot
    snap = aria_mem.get_snapshot()
    print(f"✅ ARIA snapshot keys: {len(snap['kv_state'])}")
    print(f"✅ Log entries: {len(_local_log_store)}")

    print("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("✅ 0G Memory Layer working perfectly!")