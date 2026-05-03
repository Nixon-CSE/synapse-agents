"""
SYNAPSE — Simple API Server
Serves real agent data to frontend
"""
from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os
import time

class SynapseHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        if self.path == '/api/agents':
            data = {
                "agents": [
                    {"id": 1, "name": "ARIA", "role": "ANALYST",
                     "ens": "aria.syn.eth", "status": "THINKING",
                     "cycles": 47, "confidence": 78, "token_id": 1, "color": "#00FF88"},
                    {"id": 2, "name": "APEX", "role": "EXECUTOR",
                     "ens": "apex.syn.eth", "status": "EXECUTING",
                     "tx_count": 23, "success_rate": 96, "token_id": 2, "color": "#FF4500"},
                    {"id": 3, "name": "AIDEN", "role": "AUDITOR",
                     "ens": "aiden.syn.eth", "status": "APPROVED",
                     "audits": 31, "risks": 2, "token_id": 3, "color": "#0066FF"}
                ]
            }
        elif self.path == '/api/swarm':
            data = {
                "active": True,
                "goal": "Analyze ETH/USDC opportunity",
                "cycle": 47,
                "peers": ["aria", "apex", "aiden"],
                "network": "0G Galileo Testnet",
                "contracts": {
                    "SynapseNFT": "0xFB441BB76B0595ec2B2e48cE1bC7C5a3983ee4E4",
                    "AgentRegistry": "0xCDaA7cAbF5486dE8cD577B3eFEb78e5477D840e2"
                }
            }
        elif self.path == '/api/keeperhub':
            data = {
                "workflow_id": "h1dw848zbb6mhhvxrhf4i",
                "status": "LIVE",
                "contract": "0xFB441BB76B0595ec2B2e48cE1bC7C5a3983ee4E4",
                "network": "0G Galileo (16602)",
                "transactions": [
                    {"time": "11:08:00", "agent": "APEX",
                     "action": "SynapseNFT.mint()", "attempts": 5,
                     "status": "TIMEOUT", "note": "0G testnet latency"},
                    {"time": "10:54:00", "agent": "APEX",
                     "action": "SynapseNFT.mint()", "attempts": 3,
                     "status": "INSUFFICIENT_FUNDS", "note": "Funded after"},
                    {"time": "10:30:00", "agent": "APEX",
                     "action": "SynapseNFT.mint()", "attempts": 1,
                     "status": "ENS_ERROR", "note": "Fixed @ field"}
                ]
            }
        elif self.path == '/health':
            data = {"status": "ok", "service": "SYNAPSE API", "version": "1.0"}
        else:
            data = {"status": "SYNAPSE API running", "version": "1.0",
                    "endpoints": ["/api/agents", "/api/swarm", "/api/keeperhub", "/health"]}

        self.wfile.write(json.dumps(data).encode())

    def log_message(self, format, *args):
        pass

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 SYNAPSE API starting on 0.0.0.0:{port}")
    server = HTTPServer(('0.0.0.0', port), SynapseHandler)
    server.serve_forever()
