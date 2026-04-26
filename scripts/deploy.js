const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying SYNAPSE contracts...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📍 Deployer address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Balance:", hre.ethers.formatEther(balance), "OG");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Deploy SynapseNFT
    console.log("\n📦 Deploying SynapseNFT...");
    const SynapseNFT = await hre.ethers.getContractFactory("SynapseNFT");
    const synapseNFT = await SynapseNFT.deploy();
    await synapseNFT.waitForDeployment();
    const synapseNFTAddress = await synapseNFT.getAddress();
    console.log("✅ SynapseNFT deployed at:", synapseNFTAddress);

    // Deploy AgentRegistry
    console.log("\n📦 Deploying AgentRegistry...");
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
    const agentRegistryAddress = await agentRegistry.getAddress();
    console.log("✅ AgentRegistry deployed at:", agentRegistryAddress);

    // Mint ARIA
    console.log("\n🤖 Minting Agent iNFTs...");
    const ariaTx = await synapseNFT.mint(
        deployer.address,
        "aria.syn.eth",
        "localhost:8080",
        0,
        500
    );
    await ariaTx.wait();
    console.log("  ✅ ARIA minted — Token ID: 1");

    // Mint APEX
    const apexTx = await synapseNFT.mint(
        deployer.address,
        "apex.syn.eth",
        "localhost:8081",
        1,
        500
    );
    await apexTx.wait();
    console.log("  ✅ APEX minted — Token ID: 2");

    // Mint AIDEN
    const aidenTx = await synapseNFT.mint(
        deployer.address,
        "aiden.syn.eth",
        "localhost:8082",
        2,
        500
    );
    await aidenTx.wait();
    console.log("  ✅ AIDEN minted — Token ID: 3");

    // Register ARIA
    console.log("\n📋 Registering agents...");
    const regAria = await agentRegistry.registerAgent(
        1,
        "aria.syn.eth",
        "localhost:8080",
        0,
        "synapse:agent:aria",
        "synapse:log:aria"
    );
    await regAria.wait();
    console.log("  ✅ ARIA registered");

    // Register APEX
    const regApex = await agentRegistry.registerAgent(
        2,
        "apex.syn.eth",
        "localhost:8081",
        1,
        "synapse:agent:apex",
        "synapse:log:apex"
    );
    await regApex.wait();
    console.log("  ✅ APEX registered");

    // Register AIDEN
    const regAiden = await agentRegistry.registerAgent(
        3,
        "aiden.syn.eth",
        "localhost:8082",
        2,
        "synapse:agent:aiden",
        "synapse:log:aiden"
    );
    await regAiden.wait();
    console.log("  ✅ AIDEN registered");

    // Verify swarm
    console.log("\n🔍 Verifying swarm...");
    const swarmActive = await agentRegistry.isSwarmActive();
    const totalAgents = await agentRegistry.totalAgents();
    console.log("  Total agents:", totalAgents.toString());
    console.log("  Swarm active:", swarmActive ? "✅ YES" : "❌ NO");

    // Final summary
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏆 SYNAPSE DEPLOYMENT COMPLETE!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📄 Contract Addresses:");
    console.log("   SynapseNFT:    ", synapseNFTAddress);
    console.log("   AgentRegistry: ", agentRegistryAddress);
    console.log("\n🤖 Agents:");
    console.log("   ARIA  → Token ID: 1 | aria.syn.eth");
    console.log("   APEX  → Token ID: 2 | apex.syn.eth");
    console.log("   AIDEN → Token ID: 3 | aiden.syn.eth");
    console.log("\n🔗 Add to .env:");
    console.log("   SYNAPSE_NFT_ADDRESS=" + synapseNFTAddress);
    console.log("   AGENT_REGISTRY_ADDRESS=" + agentRegistryAddress);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });