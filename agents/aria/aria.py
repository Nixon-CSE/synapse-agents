"""
SYNAPSE — ARIA Agent (Analyst)
aria.syn.eth | Token ID: 1
Researches signals, creates plans, coordinates swarm
"""

import os
import sys
import time
import json

# Add project root to path
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from storage.memory import ZeroGMemory
from compute.inference import aria_analyze, run_reflection_loop
from dotenv import load_dotenv

load_dotenv()

class ARIAAgent:
    """
    ARIA — The Analyst Agent
    Role: Research + Planning + Swarm Coordination
    """

    def __init__(self):
        self.name       = "ARIA"
        self.ens        = "aria.syn.eth"
        self.token_id   = 1
        self.role       = "ANALYST"
        self.memory     = ZeroGMemory("ARIA")
        self.status     = "IDLE"
        self.cycle      = 0

        print(f"\n{'━'*50}")
        print(f"🤖 ARIA Agent Initialized")
        print(f"   ENS:      {self.ens}")
        print(f"   Token ID: {self.token_id}")
        print(f"   Role:     {self.role}")
        print(f"{'━'*50}\n")

        # Boot sequence
        self._boot()

    def _boot(self):
        """Initialize agent state in 0G Storage"""
        self.memory.kv_set("status", "IDLE")
        self.memory.kv_set("ens", self.ens)
        self.memory.kv_set("token_id", self.token_id)
        self.memory.kv_set("role", self.role)
        self.memory.heartbeat()
        self.memory.log_append("AGENT_BOOT", {
            "agent": self.name,
            "ens":   self.ens,
            "time":  time.time()
        })
        print(f"[ARIA] ✅ Boot complete — memory initialized")

    def _set_status(self, status: str):
        """Update agent status in memory"""
        self.status = status
        self.memory.kv_set("status", status)
        self.memory.swarm_set(f"agent:aria:status", status)

    def receive_goal(self, goal: str) -> dict:
        """
        Receive a goal from user/orchestrator.
        Main entry point for ARIA.
        """
        self.cycle += 1
        print(f"\n[ARIA] 🎯 New goal received (Cycle {self.cycle})")
        print(f"[ARIA] 📋 Goal: {goal}")

        # Store goal in memory
        self._set_status("THINKING")
        self.memory.kv_set("current_goal", goal)
        self.memory.swarm_set("current_goal", goal)
        self.memory.swarm_set("cycle_id", f"cycle_{self.cycle}_{int(time.time())}")

        # Get recent history from 0G Log
        history = self.memory.log_get_recent(5)

        # Run full reflection loop
        result = run_reflection_loop(goal, history)

        # Store result in memory
        self.memory.kv_set("last_analysis", result)
        self.memory.swarm_set("aria_plan", result)

        # Log the analysis
        self.memory.log_append("ANALYSIS_COMPLETE", {
            "cycle":        self.cycle,
            "goal":         goal,
            "action":       result["final_action"],
            "approved":     result["approved"],
            "confidence":   result["aria_plan"]["confidence"]
        })

        self._set_status("DONE")

        # Simulate sending to AIDEN via AXL
        self._notify_aiden(result)

        return result

    def _notify_aiden(self, result: dict):
        """
        Notify AIDEN via AXL (simulated for now).
        Real AXL integration in Day 6.
        """
        signal_type = "GO" if result["approved"] else "ABORT"
        print(f"\n[ARIA] 📡 Sending {signal_type} signal to AIDEN via AXL...")

        # Write to shared swarm state (AIDEN will read this)
        self.memory.swarm_set("aria_signal", {
            "type":      signal_type,
            "cycle_id":  result["cycle_id"],
            "plan":      result["aria_plan"],
            "verdict":   result["aiden_verdict"],
            "timestamp": time.time()
        })

        print(f"[ARIA] ✅ Signal written to shared swarm state")

    def get_memory_snapshot(self) -> dict:
        """Get full memory state for this agent"""
        return self.memory.get_snapshot()


# ─────────────────────────────────────────
# RUN ARIA
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting ARIA Agent...")

    aria = ARIAAgent()

    # Test with a sample goal
    result = aria.receive_goal(
        "Analyze ETH/USDC market — should we execute a swap?"
    )

    print(f"\n{'━'*50}")
    print("📊 ARIA CYCLE COMPLETE")
    print(f"{'━'*50}")
    print(f"  Cycle ID:     {result['cycle_id']}")
    print(f"  Final Action: {result['final_action']}")
    print(f"  Approved:     {result['approved']}")

    # Show memory snapshot
    snap = aria.get_memory_snapshot()
    print(f"\n🧠 Memory Snapshot:")
    print(f"  KV keys stored: {len(snap['kv_state'])}")
    print(f"  Log entries:    {len(snap['recent_logs'])}")
    print(f"\n✅ ARIA running perfectly!")