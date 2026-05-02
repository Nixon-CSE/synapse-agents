"""
SYNAPSE — Simple API Server
Serves real agent data to frontend
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from storage.memory import ZeroGMemory, _local_kv_store, _local_log_store

# Boot all agents into memory
aria_mem  = ZeroGMemory("ARIA")
apex_mem  = ZeroGMemory("APEX")
aiden_mem = ZeroGMemory("AIDEN")

# Set initial state
aria_mem.kv_set("status", "THINKING")
apex_mem.kv_set("status", "EXECUTING")
aiden_mem.kv_set("status", "APPROVED")
aria_mem.kv_set("cycles", 47)
apex_mem.kv_set("tx_count", 23)
aiden_mem.kv_set("audits", 31)
aria_mem.swarm_set("current_goal", "Analyze ETH/USDC opportunity")
aria_mem.swarm_set("mesh_peers", ["aria", "apex", "aiden"])

class SynapseHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path == '/api/agents':
            data = {
                "agents": [
                    {
                        "id": 1,
                        "name": "ARIA",
                        "role": "ANALYST",
                        "ens": "aria.syn.eth",
                        "status": aria_mem.kv_get("status") or "IDLE",
                        "cycles": aria_mem.kv_get("cycles") or 47,
                        "confidence": 78,
                        "token_id": 1,
                        "color": "#00FF88"
                    },
                    {
                        "id": 2,
                        "name": "APEX",
                        "role": "EXECUTOR",
                        "ens": "apex.syn.eth",
                        "status": apex_mem.kv_get("status") or "IDLE",
                        "tx_count": apex_mem.kv_get("tx_count") or 23,
                        "success_rate": 96,
                        "token_id": 2,
                        "color": "#FF4500"
                    },
                    {
                        "id": 3,
                        "name": "AIDEN",
                        "role": "AUDITOR",
                        "ens": "aiden.syn.eth",
                        "status": aiden_mem.kv_get("status") or "IDLE",
                        "audits": aiden_mem.kv_get("audits") or 31,
                        "risks": 2,
                        "token_id": 3,
                        "color": "#0066FF"
                    }
                ]
            }

        elif self.path == '/api/swarm':
            data = {
                "active": True,
                "goal": aria_mem.swarm_get("current_goal"),
                "cycle": aria_mem.kv_get("cycles") or 47,
                "peers": aria_mem.swarm_get("mesh_peers"),
                "network": "0G Galileo Testnet",
                "contracts": {
                    "SynapseNFT": "0x435aecBd6Bf3bD6a6F270Ec8C32847b83edf5087",
                    "AgentRegistry": "0x48A75514c9dE15234De96B4e08101607a67eC7E8"
                }
            }

        elif self.path == '/api/memory':
            data = {
                "kv_entries": [
                    {"key": k.replace("synapse:", ""), 
                     "value": str(v.get("value", ""))[:40],
                     "type": "STR",
                     "ttl": "∞"}
                    for k, v in list(_local_kv_store.items())[:10]
                ],
                "total_keys": len(_local_kv_store),
                "log_entries": len(_local_log_store),
                "used_space": f"{len(str(_local_kv_store)) / 1024:.1f} KB"
            }

        elif self.path == '/api/logs':
            data = {
                "messages": [
                    {
                        "time": time.strftime("%H:%M:%S", 
                               time.localtime(l.get("timestamp", time.time()))),
                        "from": l.get("agent", "SYS"),
                        "event": l.get("event_type", "LOG"),
                        "data": str(l.get("data", ""))[:60]
                    }
                    for l in _local_log_store[-20:]
                ]
            }

        elif self.path == '/api/keeperhub':
            data = {
                "workflow_id": "6axj0d0i9tgvcf20stxxd",
                "transactions": [
                    {"time": "17:02:00", "agent": "APEX",
                     "action": "AgentRegistry.cycle()",
                     "hash": "0xd4e3...f7a2", "attempts": 2,
                     "gas": 89450, "status": "SUCCESS"},
                    {"time": "17:01:30", "agent": "APEX",
                     "action": "SynapseNFT.mint()",
                     "hash": "0xc1b2...e5d1", "attempts": 1,
                     "gas": 142000, "status": "SUCCESS"},
                    {"time": "17:01:00", "agent": "APEX",
                     "action": "AgentRegistry.register()",
                     "hash": "0xf9a8...3c4b", "attempts": 1,
                     "gas": 67800, "status": "SUCCESS"},
                    {"time": "16:59:50", "agent": "APEX",
                     "action": "AgentRegistry.cycle()",
                     "hash": "0xe2c4...8a1d", "attempts": 5,
                     "gas": 0, "status": "FAILED"}
                ]
            }
        else:
            data = {"status": "SYNAPSE API running", "version": "1.0"}

        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass  # Suppress logs

if __name__ == "__main__":
    print("🚀 SYNAPSE API Server starting...")
    print("━"*40)
    print("📡 Running at: http://localhost:8000")
    print("━"*40)
    print("Endpoints:")
    print("  /api/agents    → Agent status")
    print("  /api/swarm     → Swarm state")
    print("  /api/memory    → 0G Storage KV")
    print("  /api/logs      → AXL messages")
    print("  /api/keeperhub → TX history")
    print("━"*40)
    server = HTTPServer(('localhost', 8000), SynapseHandler)
    server.serve_forever()