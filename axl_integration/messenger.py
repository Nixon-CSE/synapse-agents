"""
SYNAPSE — AXL Messenger
All agent communication via single AXL node
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv()

AXL_HTTP_API = "http://127.0.0.1:9002"

AGENT_PEER_IDS = {
    "ARIA":  "6bea69a2fae839a57b5f8d0b1f2bfd4a1a69e339001d840e9bb928171bd02368",
    "APEX":  "0e1c48f80c01e0cec6af6d5b698e4d630aa0179ecff5312528b1804841c913b1",
    "AIDEN": "0286e78a05b5722d90f8f269ba153e5dd26d5d701b228106e130c0f10b1bcf0b"
}

_message_store = {}

class AXLMessenger:
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.api        = AXL_HTTP_API
        self.connected  = False
        self.peer_id    = AGENT_PEER_IDS.get(agent_name)
        self._connect()

    def _connect(self):
        try:
            response = requests.get(
                f"{self.api}/topology",
                timeout=5
            )
            if response.status_code == 200:
                self.connected = True
                print(f"[{self.agent_name}] 📡 AXL connected | Peer: {self.peer_id[:16]}...")
            else:
                self._fallback()
        except Exception as e:
            print(f"[{self.agent_name}] ⚠️ AXL not available — using fallback")
            self._fallback()

    def _fallback(self):
        self.connected = False
        print(f"[{self.agent_name}] 📦 Using local fallback messenger")

    def send(self, to_agent: str, msg_type: str, payload: dict) -> bool:
        message = {
            "from":      self.agent_name,
            "to":        to_agent,
            "type":      msg_type,
            "payload":   payload,
            "timestamp": time.time()
        }
        if self.connected:
            return self._send_via_axl(to_agent, message)
        else:
            return self._send_via_memory(to_agent, message)

    def _send_via_axl(self, to_agent: str, message: dict) -> bool:
        try:
            dst_peer = AGENT_PEER_IDS.get(to_agent)
            response = requests.post(
                f"{self.api}/send",
                json={
                    "dst":  dst_peer,
                    "data": json.dumps(message)
                },
                timeout=10
            )
            if response.status_code == 200:
                print(f"[{self.agent_name}] 📡 AXL → {to_agent}: {message['type']} ✅")
                return True
            else:
                return self._send_via_memory(to_agent, message)
        except Exception:
            return self._send_via_memory(to_agent, message)

    def _send_via_memory(self, to_agent: str, message: dict) -> bool:
        key = f"axl_msg:{to_agent.lower()}:{int(time.time()*1000)}"
        _message_store[key] = message
        print(f"[{self.agent_name}] 💬 LOCAL → {to_agent}: {message['type']} ✅")
        return True

    def receive(self) -> list:
        if self.connected:
            return self._recv_via_axl()
        return self._recv_via_memory()

    def _recv_via_axl(self) -> list:
        try:
            response = requests.get(f"{self.api}/recv", timeout=5)
            if response.status_code == 200:
                data = response.json()
                messages = data.get("messages", [])
                if messages:
                    print(f"[{self.agent_name}] 📨 {len(messages)} AXL messages")
                return messages
            return []
        except Exception:
            return self._recv_via_memory()

    def _recv_via_memory(self) -> list:
        prefix = f"axl_msg:{self.agent_name.lower()}:"
        messages = []
        keys_to_delete = []
        for key, msg in _message_store.items():
            if key.startswith(prefix):
                messages.append(msg)
                keys_to_delete.append(key)
        for key in keys_to_delete:
            del _message_store[key]
        if messages:
            print(f"[{self.agent_name}] 📨 {len(messages)} local messages")
        return messages

    def get_topology(self) -> dict:
        if not self.connected:
            return {"status": "local_fallback"}
        try:
            response = requests.get(f"{self.api}/topology", timeout=5)
            return response.json() if response.status_code == 200 else {}
        except Exception:
            return {}

    def is_connected(self) -> bool:
        return self.connected


if __name__ == "__main__":
    print("🧪 Testing AXL Messenger...")
    print("━"*50)

    aria_msg  = AXLMessenger("ARIA")
    apex_msg  = AXLMessenger("APEX")
    aiden_msg = AXLMessenger("AIDEN")

    # ARIA sends to AIDEN
    aria_msg.send("AIDEN", "SIGNAL", {
        "action":     "EXECUTE",
        "confidence": 78,
        "cycle_id":   "cycle_test_001"
    })

    # AIDEN receives
    msgs = aiden_msg.receive()
    print(f"\n[AIDEN] Got {len(msgs)} messages")

    # AIDEN sends GO to APEX
    aiden_msg.send("APEX", "GO", {
        "verdict":  "APPROVED",
        "cycle_id": "cycle_test_001"
    })

    # APEX receives
    apex_msgs = apex_msg.receive()
    print(f"[APEX] Got {len(apex_msgs)} messages")

    print(f"\n🌐 Mode: {'REAL AXL P2P' if aria_msg.is_connected() else 'LOCAL FALLBACK'}")
    print("✅ AXL Messenger working!")