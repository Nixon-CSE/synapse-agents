"""
SYNAPSE — APEX Agent (Executor)
apex.syn.eth | Token ID: 2
Executes onchain transactions via KeeperHub
"""

import os
import sys
import time
import json
import uuid

sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from storage.memory import ZeroGMemory
from dotenv import load_dotenv

load_dotenv()

# KeeperHub config
KEEPERHUB_API_KEY  = os.getenv("KEEPERHUB_API_KEY", "")
KEEPERHUB_MCP_URL  = os.getenv("KEEPERHUB_MCP_URL", "https://api.keeperhub.com/mcp")
MAX_RETRIES        = 5
RETRY_DELAY        = 2  # seconds

class APEXAgent:
    """
    APEX — The Executor Agent
    Role: Onchain execution via KeeperHub
    """

    def __init__(self):
        self.name     = "APEX"
        self.ens      = "apex.syn.eth"
        self.token_id = 2
        self.role     = "EXECUTOR"
        self.memory   = ZeroGMemory("APEX")
        self.status   = "IDLE"
        self.cycle    = 0

        print(f"\n{'━'*50}")
        print(f"🤖 APEX Agent Initialized")
        print(f"   ENS:      {self.ens}")
        print(f"   Token ID: {self.token_id}")
        print(f"   Role:     {self.role}")
        print(f"{'━'*50}\n")

        self._boot()

    def _boot(self):
        """Initialize APEX state in 0G Storage"""
        self.memory.kv_set("status", "IDLE")
        self.memory.kv_set("ens", self.ens)
        self.memory.kv_set("token_id", self.token_id)
        self.memory.kv_set("role", self.role)
        self.memory.kv_set("last_tx", "NONE")
        self.memory.kv_set("total_executed", 0)
        self.memory.heartbeat()
        self.memory.log_append("AGENT_BOOT", {
            "agent": self.name,
            "ens":   self.ens,
            "time":  time.time()
        })
        print(f"[APEX] ✅ Boot complete — memory initialized")

    def _set_status(self, status: str):
        """Update APEX status"""
        self.status = status
        self.memory.kv_set("status", status)
        self.memory.swarm_set("agent:apex:status", status)

    def _check_emergency_stop(self) -> bool:
        """Check if emergency stop is active"""
        stop = self.memory.swarm_get("emergency_stop")
        if stop and stop.get("active"):
            print(f"[APEX] 🚨 Emergency stop active: {stop['reason']}")
            return True
        return False

    def _simulate_keeperhub_execution(
        self,
        task: dict,
        attempt: int
    ) -> dict:
        """
        Simulate KeeperHub MCP execution.
        Real KeeperHub integration on Day 7.

        Simulates:
        - Gas optimization
        - Retry logic
        - Private routing
        - x402 payment
        """
        print(f"[APEX] ⚡ KeeperHub attempt {attempt}/{MAX_RETRIES}...")

        # Simulate occasional failures for demo
        # (attempt 1 fails, attempt 2 succeeds)
        if attempt == 1 and task.get("simulate_failure", False):
            print(f"[APEX] ❌ Attempt {attempt} failed — gas spike detected")
            print(f"[APEX] 🔄 KeeperHub retrying automatically...")
            return {"success": False, "error": "gas_spike"}

        # Simulate successful execution
        tx_hash = f"0x{uuid.uuid4().hex[:40]}"
        gas_used = 21000 + (attempt * 1000)
        fee_paid = 0.001 * attempt

        return {
            "success":   True,
            "tx_hash":   tx_hash,
            "gas_used":  gas_used,
            "fee_paid":  fee_paid,
            "attempt":   attempt,
            "routed_by": "KeeperHub",
            "routing":   "private_mempool",
            "x402_paid": True
        }

    def execute_task(self, task: dict) -> dict:
        """
        Core function — execute a task via KeeperHub.
        Handles retries automatically.
        """
        self.cycle += 1
        task_id = f"task_{self.cycle}_{int(time.time())}"

        print(f"\n[APEX] ⚡ Executing task (Cycle {self.cycle})")
        print(f"[APEX] 📋 Task: {task.get('action', 'UNKNOWN')}")

        # Check emergency stop first
        if self._check_emergency_stop():
            return {
                "success":  False,
                "error":    "emergency_stop_active",
                "task_id":  task_id,
                "cycle":    self.cycle
            }

        self._set_status("ACTIVE")
        self.memory.kv_set("current_task", task)

        # ── KeeperHub Retry Loop ──────────────────
        result = None
        for attempt in range(1, MAX_RETRIES + 1):

            result = self._simulate_keeperhub_execution(task, attempt)

            if result["success"]:
                print(f"[APEX] ✅ Transaction SUCCESS on attempt {attempt}")
                print(f"[APEX] 🔗 TX Hash: {result['tx_hash']}")
                print(f"[APEX] ⛽ Gas used: {result['gas_used']}")
                print(f"[APEX] 💳 x402 fee paid: {result['fee_paid']} OG")
                break
            else:
                if attempt < MAX_RETRIES:
                    print(f"[APEX] ⏳ Waiting {RETRY_DELAY}s before retry...")
                    time.sleep(RETRY_DELAY)
                else:
                    print(f"[APEX] ❌ All {MAX_RETRIES} attempts failed")

        # ── Store Result ──────────────────────────
        execution_record = {
            "task_id":   task_id,
            "cycle":     self.cycle,
            "task":      task,
            "result":    result,
            "timestamp": time.time(),
            "executor":  self.ens
        }

        self.memory.kv_set("last_tx", result.get("tx_hash", "FAILED"))
        self.memory.kv_set("last_execution", execution_record)
        self.memory.swarm_set("apex_last_execution", execution_record)

        # Increment total executed
        total = self.memory.kv_get("total_executed") or 0
        self.memory.kv_set("total_executed", total + 1)

        # Write to 0G Storage Log
        self.memory.log_append("EXECUTION_COMPLETE", {
            "task_id":  task_id,
            "success":  result["success"],
            "tx_hash":  result.get("tx_hash", "FAILED"),
            "attempts": result.get("attempt", MAX_RETRIES),
            "gas_used": result.get("gas_used", 0)
        })

        self._set_status("IDLE")

        # Notify AIDEN of result
        self._notify_aiden(execution_record)

        return execution_record

    def _notify_aiden(self, execution_record: dict):
        """Send execution result to AIDEN for audit"""
        print(f"\n[APEX] 📡 Sending execution result to AIDEN via AXL...")

        self.memory.swarm_set("apex_to_aiden", {
            "type":      "EXECUTION_RESULT",
            "task_id":   execution_record["task_id"],
            "success":   execution_record["result"]["success"],
            "tx_hash":   execution_record["result"].get("tx_hash"),
            "timestamp": time.time()
        })

        print(f"[APEX] ✅ Result sent to AIDEN")

    def get_execution_history(self) -> list:
        """Get all execution records from 0G Log"""
        return self.memory.log_get_recent(20)


# ─────────────────────────────────────────
# RUN APEX
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🚀 Starting APEX Agent...")

    apex = APEXAgent()

    # Test 1 — Normal execution
    print("\n🧪 Test 1: Normal execution")
    result = apex.execute_task({
        "action":           "SWAP",
        "from_token":       "ETH",
        "to_token":         "USDC",
        "amount":           "0.1",
        "slippage":         "0.5%",
        "simulate_failure": False
    })
    print(f"  Success: {result['result']['success']}")
    print(f"  TX Hash: {result['result'].get('tx_hash', 'N/A')[:20]}...")

    # Test 2 — Retry execution (simulates gas spike)
    print("\n🧪 Test 2: Retry execution (gas spike simulation)")
    result2 = apex.execute_task({
        "action":           "SWAP",
        "from_token":       "ETH",
        "to_token":         "USDC",
        "amount":           "0.5",
        "slippage":         "0.5%",
        "simulate_failure": True
    })
    print(f"  Success:  {result2['result']['success']}")
    print(f"  Attempts: {result2['result'].get('attempt', 'N/A')}")
    print(f"  TX Hash:  {result2['result'].get('tx_hash', 'N/A')[:20]}...")

    print(f"\n{'━'*50}")
    print("📊 APEX CYCLE COMPLETE")
    print(f"{'━'*50}")
    print(f"  Total executed: {apex.memory.kv_get('total_executed')}")
    print(f"\n✅ APEX running perfectly!")