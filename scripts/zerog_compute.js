/**
 * SYNAPSE — 0G Compute Bridge
 * Calls real 0G Compute Network for agent inference
 * Run: node scripts/zerog_compute.js "your signal here"
 */

const { ethers } = require("ethers");
require("dotenv").config();

async function callZeroGCompute(agentRole, signal) {
    console.log(`[0G] 🔗 Connecting to 0G Compute Network...`);

    try {
        const { createZGComputeNetworkBroker } =
            require("@0glabs/0g-serving-broker");

        // Connect to 0G testnet
        const provider = new ethers.JsonRpcProvider(
            process.env.ZEROG_RPC_URL || "https://evmrpc-testnet.0g.ai"
        );
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

        console.log(`[0G] 👛 Wallet: ${wallet.address}`);

        // Create broker
        const broker = await createZGComputeNetworkBroker(wallet);
        console.log(`[0G] ✅ Broker created`);

        // List available services
        const services = await broker.inference.listService();
        console.log(`[0G] 📋 Available services: ${services.length}`);

        if (services.length === 0) {
            console.log(`[0G] ⚠️ No services available — using mock`);
            return getMockResponse(agentRole, signal);
        }

        // Find qwen3 service
        const qwenService = services.find(s =>
            s.model && s.model.toLowerCase().includes('qwen')
        ) || services[0];

        console.log(`[0G] 🤖 Using service: ${qwenService.provider}`);
        console.log(`[0G] 📦 Model: ${qwenService.model}`);

        // Get endpoint and headers
        const { endpoint, model } = await broker.inference.getServiceMetadata(
            qwenService.provider
        );
        const headers = await broker.inference.getRequestHeaders(
            qwenService.provider,
            signal
        );

        console.log(`[0G] 🌐 Endpoint: ${endpoint}`);

        // Build prompt based on agent role
        const systemPrompt = agentRole === "ARIA"
            ? `You are ARIA, an analyst agent. Analyze signals and respond ONLY in JSON:
         {"analysis":"brief analysis","action":"EXECUTE or WAIT","confidence":0-100,"reasoning":"why","risk_level":"LOW/MEDIUM/HIGH"}`
            : `You are AIDEN, an auditor agent. Critique plans and respond ONLY in JSON:
         {"verdict":"APPROVED or REJECTED","risk_score":0-100,"risks_found":["risk1"],"recommendation":"brief rec","confidence":0-100}`;

        // Call 0G Compute
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...headers
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: signal }
                ],
                max_tokens: 300,
                temperature: 0.3
            })
        });

        const data = await response.json();
        console.log(`[0G] ✅ Inference complete!`);

        const content = data.choices[0].message.content;
        console.log(`[0G] 💬 Raw response: ${content}`);

        // Output JSON for Python to parse
        console.log("ZEROG_RESULT:" + JSON.stringify({
            success: true,
            agent: agentRole,
            result: content,
            model: model,
            provider: qwenService.provider
        }));

    } catch (error) {
        console.error(`[0G] ❌ Error: ${error.message}`);
        console.log("ZEROG_RESULT:" + JSON.stringify({
            success: false,
            agent: agentRole,
            error: error.message,
            mock: getMockResponse(agentRole, signal)
        }));
    }
}

function getMockResponse(agentRole, signal) {
    if (agentRole === "ARIA") {
        return {
            analysis: `Signal detected: ${signal}. Bullish momentum.`,
            action: "EXECUTE",
            confidence: 78,
            reasoning: "Strong signal with acceptable risk",
            risk_level: "MEDIUM"
        };
    }
    return {
        verdict: "APPROVED",
        risk_score: 35,
        risks_found: ["Gas price volatility"],
        recommendation: "Proceed with caution",
        confidence: 85
    };
}

// Run
const agentRole = process.argv[2] || "ARIA";
const signal = process.argv[3] || "ETH price up 3.2%, volume spike";
callZeroGCompute(agentRole, signal);