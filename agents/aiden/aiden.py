"""
SYNAPSE — AIDEN Agent (Auditor)
aiden.syn.eth | Token ID: 3
Validates plans, critiques decisions, writes audit logs
"""

import os
import sys
import time
import json

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from storage.memory import ZeroGMemory
from compute.inference import aiden_critique
from dotenv import load_dotenv

load_dotenv()

class AIDENAgent:
    """
    AIDEN — The Auditor Agent
    Role: Validation + Risk Assessment + Audit Logging
    """

    def __init__(self):
        self.name     = "AIDEN"
        self.ens      = "aiden.syn.eth"
        self.token_id = 3
        self.role     = "AUDITOR"
        self.memory   = ZeroGMemory("AIDEN")
        self.status   = "IDLE"
        self.cycle    = 0

        print(f"\n{'━'*50}")
        print(f"🤖 AIDEN Agent Initialized")
        print(f"   ENS:      {self.ens}")
        print(f"   Token ID: {self.token_id}")
        print(f"   Role:     {self.role}")
        print(f"{'━'*50}\n")

        self._boot()

    def _boot(self):
        """Initialize AIDEN state in 0G Storage"""
        self.memory.kv_set("status", "IDLE")
        self.memory.kv_set("ens", self.ens)
        self.memory.kv_set("token_id", self.token_id)
        self.memory.kv_set("role", self.role)
        self.memory.kv_set("last_verdict", "NONE")
        self.memory.heartbeat()
        self.memory.log_append("AGENT_BOOT", {
            "agent": self.name,
            "ens":   self.ens,
            "time":  time.time()
        })
        print(f"[AIDEN] ✅ Boot complete — memory initialized")

    def _set_status(self, status: str):
        """Update AIDEN status"""
        self.status = status
        self.memory.kv_set("status", status)
        self.memory.swarm_set("agent:aiden:status", status)

    def review_plan(self, plan: dict, signal: str = "") -> dict:
        """
        Core function — review ARIA's plan.
        Returns verdict: APPROVED or REJECTED
        """
        self.cycle += 1
        print(f"\n[AIDEN] 🔍 Reviewing plan (Cycle {self.cycle})")

        self._set_status("THINKING")
        self.memory.kv_set("current_review", plan)

        # Run critique inference on 0G Compute
        verdict = aiden_critique(plan, context=signal)

        # Store verdict
        self.memory.kv_set("last_verdict", verdict["verdict"])
        self.memory.kv_set("last_risk_score", verdict["risk_score"])
        self.memory.swarm_set("aiden_verdict", verdict)

        # Write to audit log
        self.memory.log_append("AUDIT_COMPLETE", {
            "cycle":       self.cycle,
            "verdict":     verdict["verdict"],
            "risk_score":  verdict["risk_score"],
            "risks_found": verdict["risks_found"],
            "plan":        plan
        })

        self._set_status("DONE")

        # Notify APEX
        self._notify_apex(verdict)

        return verdict

    def _notify_apex(self, verdict: dict):
        """
        Send GO or STOP signal to APEX via AXL.
        Simulated here — real AXL on Day 6.
        """
        signal_type = "GO" if verdict["verdict"] == "APPROVED" else "STOP"
        emoji = "🚀" if signal_type == "GO" else "🛑"

        print(f"\n[AIDEN] 📡 Sending {emoji} {signal_type} to APEX via AXL...")

        self.memory.swarm_set("aiden_to_apex", {
            "signal":    signal_type,
            "verdict":   verdict["verdict"],
            "risk_score": verdict["risk_score"],
            "risks":     verdict["risks_found"],
            "timestamp": time.time()
        })

        print(f"[AIDEN] ✅ {signal_type} signal written to swarm state")

    def write_final_audit(self, cycle_result: dict):
        """
        Write final audit record after APEX execution.
        Called after KeeperHub confirms transaction.
        """
        print(f"\n[AIDEN] 📝 Writing final audit record...")

        self.memory.log_append("FINAL_AUDIT", {
            "cycle_id":    cycle_result.get("cycle_id"),
            "signal":      cycle_result.get("signal"),
            "action_taken": cycle_result.get("action"),
            "tx_hash":     cycle_result.get("tx_hash", "pending"),
            "success":     cycle_result.get("success", False),
            "timestamp":   time.time(),
            "auditor":     self.ens
        })

        print(f"[AIDEN] ✅ Final audit written to 0G Storage Log")

    def get_audit_history(self) -> list:
        """Get full audit history from 0G Log"""
        return self.memory.log_get_all()

    def emergency_stop(self, reason: str):
        """
        Broadcast emergency STOP to entire swarm.
        Written to shared swarm state immediately.
        """
        print(f"\n[AIDEN] 🚨 EMERGENCY STOP — {reason}")

        self.memory.swarm_set("emergency_stop", {
            "active":    True,
            "reason":    reason,
            "timestamp": time.time(),
            "triggered_by": self.ens
        })

        self.memory.log_append("EMERGENCY_STOP", {
            "reason":    reason,
            "timestamp": time.time()
        })

        self._set_status("PAUSED")
        print(f"[AIDEN] 🚨 Emergency stop broadcast to swarm")


# ─────────────────────────────────────────
# RUN AIDEN
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting AIDEN Agent...")

    aiden = AIDENAgent()

    # Simulate reviewing a plan from ARIA
    mock_plan = {
        "action":     "EXECUTE",
        "confidence": 78,
        "risk_level": "MEDIUM",
        "reasoning":  "Strong signal with acceptable risk",
        "signal":     "ETH up 3.2%"
    }

    verdict = aiden.review_plan(
        mock_plan,
        signal="ETH/USDC opportunity detected"
    )

    print(f"\n{'━'*50}")
    print("📊 AIDEN CYCLE COMPLETE")
    print(f"{'━'*50}")
    print(f"  Verdict:    {verdict['verdict']}")
    print(f"  Risk Score: {verdict['risk_score']}/100")
    print(f"  Risks:      {verdict['risks_found']}")

    # Test emergency stop
    print("\n🧪 Testing emergency stop...")
    aiden.emergency_stop("Test — high risk detected")

    print(f"\n✅ AIDEN running perfectly!")