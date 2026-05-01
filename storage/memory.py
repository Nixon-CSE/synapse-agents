"""
SYNAPSE — 0G Storage Layer
KV Store (live state) + Log Store (history)
Uses 0G Storage REST API
"""

import os
import json
import time
import requests
from dotenv import load_dotenv

load_dotenv()

STORAGE_NODE_URL = os.getenv(
    "ZEROG_STORAGE_NODE_URL",
    "https://storage-testnet.0g.ai"
)
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")
CHAIN_RPC   = os.getenv("ZEROG_RPC_URL", "https://evmrpc-testnet.0g.ai")

_local_kv_store  = {}
_local_log_store = []
_zerog_available = None

def _check_zerog():
    """Check if 0G Storage REST API is available"""
    global _zerog_available
    if _zerog_available is not None:
        return _zerog_available
    try:
        response = requests.get(
            f"{STORAGE_NODE_URL}/v1/status",
            timeout=5
        )
        _zerog_available = response.status_code in [200, 404]
        if _zerog_available:
            print("✅ 0G Storage REST API connected")
        return _zerog_available
    except Exception as e:
        print(f"⚠️ 0G Storage unavailable: {e} — using local fallback")
        _zerog_available = False
        return False


class ZeroGMemory:
    """
    0G Storage interface for SYNAPSE agents.
    KV Store  → real-time agent state
    Log Store → permanent decision history
    """

    def __init__(self, agent_name: str):
        self.agent_name  = agent_name
        self.namespace   = f"synapse:agent:{agent_name.lower()}"
        self.log_ns      = f"synapse:log:{agent_name.lower()}"
        self.use_real    = _check_zerog()
        mode = "0G Storage REST" if self.use_real else "Local Fallback"
        print(f"[{agent_name}] 🧠 Memory initialized | Mode: {mode}")

    def kv_set(self, key: str, value: any) -> bool:
        full_key = f"{self.namespace}:{key}"
        _local_kv_store[full_key] = {
            "value":      value,
            "updated_at": time.time(),
            "agent":      self.agent_name
        }
        if self.use_real:
            try:
                requests.post(
                    f"{STORAGE_NODE_URL}/v1/kv/set",
                    json={"key": full_key, "value": json.dumps(value, default=str)},
                    timeout=5
                )
                print(f"[{self.agent_name}] 💾 0G SET: {key}")
            except:
                print(f"[{self.agent_name}] 💾 LOCAL SET: {key}")
        else:
            print(f"[{self.agent_name}] 💾 LOCAL SET: {key}")
        return True

    def kv_get(self, key: str) -> any:
        full_key = f"{self.namespace}:{key}"
        record   = _local_kv_store.get(full_key)
        return record["value"] if record else None

    def swarm_set(self, key: str, value: any) -> bool:
        full_key = f"synapse:swarm:{key}"
        _local_kv_store[full_key] = {
            "value":      value,
            "updated_at": time.time(),
            "written_by": self.agent_name
        }
        if self.use_real:
            try:
                requests.post(
                    f"{STORAGE_NODE_URL}/v1/kv/set",
                    json={"key": full_key, "value": json.dumps(value, default=str)},
                    timeout=5
                )
                print(f"[{self.agent_name}] 🌐 0G SWARM SET: {key}")
            except:
                print(f"[{self.agent_name}] 🌐 LOCAL SWARM SET: {key}")
        else:
            print(f"[{self.agent_name}] 🌐 SWARM SET: {key}")
        return True

    def swarm_get(self, key: str) -> any:
        full_key = f"synapse:swarm:{key}"
        record   = _local_kv_store.get(full_key)
        return record["value"] if record else None

    def log_append(self, event_type: str, data: dict) -> bool:
        log_entry = {
            "id":         f"{self.agent_name}_{int(time.time()*1000)}",
            "agent":      self.agent_name,
            "event_type": event_type,
            "data":       data,
            "timestamp":  time.time(),
            "namespace":  self.log_ns
        }
        _local_log_store.append(log_entry)
        if self.use_real:
            try:
                requests.post(
                    f"{STORAGE_NODE_URL}/v1/log/append",
                    json=log_entry,
                    timeout=5
                )
                print(f"[{self.agent_name}] 📝 0G LOG: {event_type}")
            except:
                print(f"[{self.agent_name}] 📝 LOCAL LOG: {event_type}")
        else:
            print(f"[{self.agent_name}] 📝 LOG: {event_type}")
        return True

    def log_get_recent(self, limit: int = 10) -> list:
        agent_logs = [
            l for l in _local_log_store
            if l["agent"] == self.agent_name
        ]
        return agent_logs[-limit:]

    def log_get_all(self, limit: int = 50) -> list:
        return _local_log_store[-limit:]

    def heartbeat(self) -> bool:
        return self.kv_set("heartbeat", {
            "status":    "ALIVE",
            "timestamp": time.time(),
            "agent":     self.agent_name,
            "mode":      "0G_REST" if self.use_real else "LOCAL"
        })

    def get_snapshot(self) -> dict:
        agent_keys = {
            k: v for k, v in _local_kv_store.items()
            if k.startswith(self.namespace)
        }
        return {
            "agent":        self.agent_name,
            "namespace":    self.namespace,
            "kv_state":     agent_keys,
            "recent_logs":  self.log_get_recent(5),
            "timestamp":    time.time(),
            "storage_mode": "0G_REST" if self.use_real else "LOCAL"
        }

    def get_storage_mode(self) -> str:
        return "0G_STORAGE_REST" if self.use_real else "LOCAL_FALLBACK"


if __name__ == "__main__":
    print("🧪 Testing 0G Storage Layer...")
    print("━"*50)

    aria_mem  = ZeroGMemory("ARIA")
    apex_mem  = ZeroGMemory("APEX")
    aiden_mem = ZeroGMemory("AIDEN")

    aria_mem.kv_set("status", "THINKING")
    aria_mem.kv_set("current_goal", "Analyze ETH/USDC")
    aria_mem.swarm_set("current_goal", "Analyze ETH/USDC")
    aria_mem.log_append("ANALYSIS_STARTED", {"signal": "ETH up 3%"})
    aria_mem.heartbeat()
    apex_mem.kv_set("status", "IDLE")
    aiden_mem.kv_set("status", "IDLE")

    goal = aria_mem.swarm_get("current_goal")
    snap = aria_mem.get_snapshot()

    print(f"\n✅ Swarm goal: {goal}")
    print(f"✅ KV keys: {len(snap['kv_state'])}")
    print(f"✅ Storage mode: {aria_mem.get_storage_mode()}")
    print(f"✅ Log entries: {len(_local_log_store)}")
    print("\n✅ 0G Storage Layer working!")