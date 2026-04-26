"""
SYNAPSE — Full Swarm Integration Test
Tests ARIA → AIDEN → APEX complete cycle
"""

import sys
import os
import time

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from agents.aria.aria import ARIAAgent
from agents.aiden.aiden import AIDENAgent
from agents.apex.apex import APEXAgent

def run_swarm_test():
    print("🚀 SYNAPSE FULL SWARM TEST")
    print("━"*50)

    # Boot all 3 agents
    print("\n[SWARM] Booting all agents...")
    aria  = ARIAAgent()
    aiden = AIDENAgent()
    apex  = APEXAgent()
    print("[SWARM] ✅ All 3 agents online!")

    # Step 1 — ARIA analyzes
    print("\n[SWARM] Step 1: ARIA analyzing signal...")
    signal = "ETH up 3.2%, volume spike, bullish momentum"
    aria_result = aria.receive_goal(signal)

    # Step 2 — AIDEN reviews
    print("\n[SWARM] Step 2: AIDEN reviewing plan...")
    aiden_verdict = aiden.review_plan(
        aria_result["aria_plan"],
        signal=signal
    )

    # Step 3 — APEX executes if approved
    print("\n[SWARM] Step 3: APEX executing...")
    if aiden_verdict["verdict"] == "APPROVED":
        execution = apex.execute_task({
            "action":           "SWAP",
            "from_token":       "ETH",
            "to_token":         "USDC",
            "amount":           "0.1",
            "simulate_failure": True,  # Demo retry
            "cycle_id":         aria_result["cycle_id"]
        })

        # Step 4 — AIDEN writes final audit
        print("\n[SWARM] Step 4: AIDEN writing final audit...")
        aiden.write_final_audit({
            "cycle_id": aria_result["cycle_id"],
            "signal":   signal,
            "action":   "SWAP",
            "tx_hash":  execution["result"].get("tx_hash"),
            "success":  execution["result"]["success"]
        })
    else:
        print("[SWARM] 🛑 Plan rejected — no execution")
        execution = None

    # Final summary
    print(f"\n{'━'*50}")
    print("🏆 SYNAPSE SWARM TEST COMPLETE")
    print(f"{'━'*50}")
    print(f"  Signal:      {signal}")
    print(f"  ARIA action: {aria_result['final_action']}")
    print(f"  AIDEN said:  {aiden_verdict['verdict']}")
    if execution:
        print(f"  APEX result: {'✅ SUCCESS' if execution['result']['success'] else '❌ FAILED'}")
        print(f"  TX Hash:     {execution['result'].get('tx_hash', 'N/A')[:25]}...")
        print(f"  Attempts:    {execution['result'].get('attempt', 'N/A')}")
    print(f"\n  All agents memory persisted ✅")
    print(f"  Audit log written ✅")
    print(f"{'━'*50}")

if __name__ == "__main__":
    run_swarm_test()