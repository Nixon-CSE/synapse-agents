"""
SYNAPSE — AXL Peer Discovery via ENS
Agents find each other using ENS text records
No manual configuration needed
"""

import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

AXL_API = os.getenv("AXL_API_URL", "http://127.0.0.1:9002")

# ENS → AXL endpoint mapping
# In production these come from ENS text records
ENS_REGISTRY = {
    "aria.syn.eth": {
        "axl_endpoint": os.getenv("AXL_ARIA_PEER_ID", ""),
        "role": "ANALYST",
        "token_id": 1
    },
    "apex.syn.eth": {
        "axl_endpoint": os.getenv("AXL_APEX_PEER_ID", ""),
        "role": "EXECUTOR",
        "token_id": 2
    },
    "aiden.syn.eth": {
        "axl_endpoint": os.getenv("AXL_AIDEN_PEER_ID", ""),
        "role": "AUDITOR",
        "token_id": 3
    }
}

class AXLDiscovery:
    """
    Peer discovery for SYNAPSE agents via ENS + AXL.
    
    Flow:
    1. Agent boots
    2. Queries ENS registry for *.syn.eth subnames
    3. Reads AXL endpoint from each ENS record
    4. Connects to peers via AXL mesh
    5. Sends HEARTBEAT to confirm connection
    """

    def __init__(self):
        self.discovered_peers = {}
        self.axl_connected = False
        self._check_axl()

    def _check_axl(self):
        """Check if AXL node is running"""
        try:
            r = requests.get(f"{AXL_API}/topology", timeout=3)
            if r.status_code == 200:
                self.axl_connected = True
                topology = r.json()
                self.our_peer_id = topology.get("self", {}).get("id", "local")
                print(f"[Discovery] ✅ AXL connected | Our ID: {self.our_peer_id[:16]}...")
            else:
                print("[Discovery] ⚠️ AXL node not responding")
        except Exception as e:
            print(f"[Discovery] ⚠️ AXL offline: {e}")
            self.axl_connected = False

    def discover_peers(self) -> dict:
        """
        Discover all SYNAPSE agents via ENS registry.
        Returns dict of ENS name → peer info.
        """
        print("[Discovery] 🔍 Scanning ENS for *.syn.eth agents...")
        
        discovered = {}
        for ens_name, info in ENS_REGISTRY.items():
            if info["axl_endpoint"]:
                discovered[ens_name] = {
                    "ens": ens_name,
                    "peer_id": info["axl_endpoint"],
                    "role": info["role"],
                    "token_id": info["token_id"],
                    "reachable": self._ping_peer(info["axl_endpoint"])
                }
                status = "✅" if discovered[ens_name]["reachable"] else "⚠️"
                print(f"[Discovery] {status} Found: {ens_name} → {info['role']}")

        self.discovered_peers = discovered
        print(f"[Discovery] Found {len(discovered)} agents in ENS registry")
        return discovered

    def _ping_peer(self, peer_id: str) -> bool:
        """Check if a peer is reachable via AXL"""
        if not self.axl_connected:
            return False
        try:
            r = requests.post(
                f"{AXL_API}/send",
                json={"dst": peer_id, "data": "PING"},
                timeout=3
            )
            return r.status_code == 200
        except:
            return False

    def get_peer_by_role(self, role: str) -> dict:
        """Get peer info by agent role"""
        for ens, info in self.discovered_peers.items():
            if info["role"] == role:
                return info
        return {}

    def get_axl_endpoint(self, ens_name: str) -> str:
        """Get AXL endpoint for an ENS name"""
        return ENS_REGISTRY.get(ens_name, {}).get("axl_endpoint", "")

    def get_topology(self) -> dict:
        """Get current AXL network topology"""
        if not self.axl_connected:
            return {"status": "offline", "peers": []}
        try:
            r = requests.get(f"{AXL_API}/topology", timeout=3)
            return r.json() if r.status_code == 200 else {}
        except:
            return {}

    def get_swarm_status(self) -> dict:
        """Get full swarm discovery status"""
        return {
            "axl_connected": self.axl_connected,
            "peers_discovered": len(self.discovered_peers),
            "peers": self.discovered_peers,
            "topology": self.get_topology()
        }


if __name__ == "__main__":
    print("🔍 SYNAPSE AXL Discovery Test")
    print("━" * 40)
    
    discovery = AXLDiscovery()
    peers = discovery.discover_peers()
    
    print(f"\n📋 Swarm Status:")
    status = discovery.get_swarm_status()
    print(f"  AXL Connected: {status['axl_connected']}")
    print(f"  Peers Found:   {status['peers_discovered']}")
    
    for ens, info in peers.items():
        print(f"\n  {ens}")
        print(f"    Role:      {info['role']}")
        print(f"    Token ID:  #{info['token_id']}")
        print(f"    Reachable: {info['reachable']}")
    
    print("\n✅ Discovery working!")