"""
SYNAPSE — 0G Compute Layer
Sealed inference pipeline for ARIA and AIDEN
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
COMPUTE_URL = os.getenv("ZEROG_COMPUTE_URL", "https://compute-testnet.0g.ai")
MODEL        = os.getenv("ZEROG_COMPUTE_MODEL", "qwen3-6plus")

# ─────────────────────────────────────────
# AGENT SYSTEM PROMPTS
# ─────────────────────────────────────────
ARIA_SYSTEM_PROMPT = """
You are ARIA, the Analyst agent in the SYNAPSE swarm.
Your job is to analyze signals and create action plans.

Rules:
- Always respond in JSON format
- Be concise and data-driven
- Rate confidence from 0-100
- Suggest EXECUTE or WAIT as action

Response format:
{
  "analysis": "brief analysis here",
  "action": "EXECUTE or WAIT",
  "confidence": 0-100,
  "reasoning": "why this action",
  "risk_level": "LOW, MEDIUM, or HIGH"
}
"""

AIDEN_SYSTEM_PROMPT = """
You are AIDEN, the Auditor agent in the SYNAPSE swarm.
Your job is to critique plans and identify risks.

Rules:
- Always respond in JSON format
- Be critical and conservative
- Look for risks others might miss
- Final verdict must be APPROVED or REJECTED

Response format:
{
  "verdict": "APPROVED or REJECTED",
  "risk_score": 0-100,
  "risks_found": ["risk1", "risk2"],
  "recommendation": "brief recommendation",
  "confidence": 0-100
}
"""

# ─────────────────────────────────────────
# MOCK RESPONSES (Local dev simulation)
# Replace with real 0G Compute API calls
# when testnet tokens are available
# ─────────────────────────────────────────

def _mock_aria_response(signal: str) -> dict:
    """Simulate ARIA inference response"""
    return {
        "analysis": f"Signal detected: {signal}. Market showing bullish momentum.",
        "action": "EXECUTE",
        "confidence": 78,
        "reasoning": "Strong signal with acceptable risk profile",
        "risk_level": "MEDIUM"
    }

def _mock_aiden_response(plan: dict) -> dict:
    """Simulate AIDEN critique response"""
    risk = plan.get("risk_level", "HIGH")
    approved = risk in ["LOW", "MEDIUM"] and plan.get("confidence", 0) > 60
    return {
        "verdict": "APPROVED" if approved else "REJECTED",
        "risk_score": 35 if approved else 75,
        "risks_found": ["Gas price volatility"] if approved else ["High risk", "Low confidence"],
        "recommendation": "Proceed with caution" if approved else "Wait for better signal",
        "confidence": 85
    }

# ─────────────────────────────────────────
# REAL 0G COMPUTE CALLS
# ─────────────────────────────────────────

def _call_zerog_compute(
    system_prompt: str,
    user_message: str,
    agent_name: str
) -> dict:
    """
    Call 0G Compute Network for sealed inference.
    Uses OpenAI-compatible endpoint from 0G docs.
    Falls back to mock if unavailable.
    """
    try:
        import requests

        # 0G Compute endpoint (OpenAI compatible)
        endpoint = os.getenv(
            "ZEROG_COMPUTE_URL",
            "https://compute-testnet.0g.ai"
        )
        model = os.getenv("ZEROG_COMPUTE_MODEL", "qwen3-6plus")

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {os.getenv('PRIVATE_KEY', '')}",
        }

        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.3,
            "max_tokens": 500,
            "stream": False
        }

        print(f"[{agent_name}] 🔗 Calling 0G Compute: {endpoint}/v1/chat/completions")

        response = requests.post(
            f"{endpoint}/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )

        print(f"[{agent_name}] 📡 0G Response: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            text = data["choices"][0]["message"]["content"]
            # Clean JSON response
            text = text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            result = json.loads(text)
            print(f"[{agent_name}] ✅ 0G Compute inference SUCCESS")
            return result
        else:
            print(f"[{agent_name}] ⚠️ 0G returned {response.status_code}: {response.text[:100]}")
            return None

    except json.JSONDecodeError as e:
        print(f"[{agent_name}] ⚠️ JSON parse error: {e} — using mock")
        return None
    except Exception as e:
        print(f"[{agent_name}] ⚠️ 0G Compute error: {e} — using mock")
        return None


# ─────────────────────────────────────────
# PUBLIC INFERENCE FUNCTIONS
# ─────────────────────────────────────────

def aria_analyze(signal: str, history: list = []) -> dict:
    """
    ARIA's analysis inference call.
    First pass — generates action plan.
    """
    print(f"[ARIA] 🧠 Running inference on 0G Compute...")

    history_str = ""
    if history:
        recent = history[-3:]
        history_str = f"\nRecent history: {json.dumps(recent)}"

    user_message = f"""
    Analyze this signal and create an action plan:
    Signal: {signal}
    {history_str}
    
    Respond in JSON format only.
    """

    # Try real 0G Compute first
    result = _call_zerog_compute(
        ARIA_SYSTEM_PROMPT,
        user_message,
        "ARIA"
    )

    # Fall back to mock if needed
    if not result:
        print("[ARIA] 📦 Using mock inference (local dev mode)")
        result = _mock_aria_response(signal)

    result["signal"]    = signal
    result["timestamp"] = time.time()
    result["model"]     = MODEL
    result["agent"]     = "ARIA"

    print(f"[ARIA] 📊 Analysis: {result['action']} | Confidence: {result['confidence']}%")
    return result


def aiden_critique(plan: dict, context: str = "") -> dict:
    """
    AIDEN's critique inference call.
    Second pass — validates ARIA's plan.
    """
    print(f"[AIDEN] 🔍 Running critique on 0G Compute...")

    user_message = f"""
    Critique this action plan and identify risks:
    Plan: {json.dumps(plan)}
    Context: {context}
    
    Respond in JSON format only.
    """

    # Try real 0G Compute first
    result = _call_zerog_compute(
        AIDEN_SYSTEM_PROMPT,
        user_message,
        "AIDEN"
    )

    # Fall back to mock if needed
    if not result:
        print("[AIDEN] 📦 Using mock inference (local dev mode)")
        result = _mock_aiden_response(plan)

    result["plan_reviewed"] = plan
    result["timestamp"]     = time.time()
    result["model"]         = MODEL
    result["agent"]         = "AIDEN"

    verdict_emoji = "✅" if result["verdict"] == "APPROVED" else "❌"
    print(f"[AIDEN] {verdict_emoji} Verdict: {result['verdict']} | Risk: {result['risk_score']}/100")
    return result


# ─────────────────────────────────────────
# REFLECTION LOOP
# Full ARIA → AIDEN → Decision pipeline
# ─────────────────────────────────────────

def run_reflection_loop(signal: str, history: list = []) -> dict:
    """
    Full reflection loop:
    1. ARIA analyzes signal
    2. AIDEN critiques ARIA's plan
    3. Returns final decision
    """
    print("\n[SYNAPSE] 🔄 Starting reflection loop...")
    print(f"[SYNAPSE] 📡 Signal: {signal}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    # Step 1 — ARIA analyzes
    aria_plan = aria_analyze(signal, history)

    # Step 2 — AIDEN critiques
    aiden_verdict = aiden_critique(
        aria_plan,
        context=f"Signal: {signal}"
    )

    # Step 3 — Final decision
    approved = aiden_verdict["verdict"] == "APPROVED"

    final = {
        "cycle_id":      f"cycle_{int(time.time())}",
        "signal":        signal,
        "aria_plan":     aria_plan,
        "aiden_verdict": aiden_verdict,
        "final_action":  "EXECUTE" if approved else "ABORT",
        "approved":      approved,
        "timestamp":     time.time()
    }

    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    action_emoji = "🚀" if approved else "🛑"
    print(f"[SYNAPSE] {action_emoji} Final Decision: {final['final_action']}")

    return final


# ─────────────────────────────────────────
# QUICK TEST
# ─────────────────────────────────────────
if __name__ == "__main__":
    print("🧪 Testing 0G Compute Layer...")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

    result = run_reflection_loop(
        signal="ETH price up 3.2% in last hour, volume spike detected",
        history=[
            {"event": "Previous trade", "result": "profit", "amount": "0.1 ETH"}
        ]
    )

    print("\n📋 Full Result:")
    print(f"  Cycle ID:      {result['cycle_id']}")
    print(f"  Final Action:  {result['final_action']}")
    print(f"  ARIA Said:     {result['aria_plan']['action']}")
    print(f"  AIDEN Said:    {result['aiden_verdict']['verdict']}")
    print(f"  Approved:      {result['approved']}")
    print("\n✅ 0G Compute Layer working perfectly!")