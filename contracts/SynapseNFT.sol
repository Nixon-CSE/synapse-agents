// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgent.sol";

contract SynapseNFT {

    string public name = "SYNAPSE Agent";
    string public symbol = "SYN";
    address public owner;
    uint256 public totalSupply;

    mapping(uint256 => address) public tokenOwner;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => address) public tokenApprovals;
    mapping(address => mapping(address => bool)) public operatorApprovals;
    mapping(uint256 => Intelligence) public intelligence;
    mapping(uint256 => AgentProfile) public agentProfiles;
    mapping(uint256 => RoyaltyInfo) public royalties;
    mapping(uint256 => uint256) public usageCount;

    struct Intelligence {
        bytes32 storageRoot;
        bytes32 encryptedKeyHash;
        string kvNamespace;
        string logNamespace;
        uint256 memoryVersion;
        uint256 lastUpdated;
        bool initialized;
    }

    struct AgentProfile {
        string ensName;
        string axlEndpoint;
        IAgent.AgentRole role;
        IAgent.AgentStatus status;
        uint256 totalCycles;
        uint256 mintedAt;
    }

    struct RoyaltyInfo {
        address recipient;
        uint256 basisPoints;
        uint256 totalEarned;
    }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);

    event IntelligenceMinted(
        uint256 indexed tokenId,
        bytes32 storageRoot,
        string kvNamespace,
        uint256 timestamp
    );

    event IntelligenceUpdated(
        uint256 indexed tokenId,
        bytes32 oldStorageRoot,
        bytes32 newStorageRoot,
        uint256 newVersion,
        uint256 timestamp
    );

    event IntelligenceTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 storageRoot,
        uint256 memoryVersion
    );

    event RoyaltyPaid(
        uint256 indexed tokenId,
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    event AgentCycleCompleted(
        uint256 indexed tokenId,
        uint256 totalCycles,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "SynapseNFT: Not owner");
        _;
    }

    modifier onlyTokenOwner(uint256 tokenId) {
        require(tokenOwner[tokenId] == msg.sender, "SynapseNFT: Not token owner");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(tokenOwner[tokenId] != address(0), "SynapseNFT: Token does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalSupply = 0;
    }

    function mint(
        address to,
        string calldata ensName,
        string calldata axlEndpoint,
        IAgent.AgentRole role,
        uint256 royaltyBasisPoints
    ) external onlyOwner returns (uint256) {
        require(to != address(0), "SynapseNFT: Mint to zero address");
        require(royaltyBasisPoints <= 1000, "SynapseNFT: Max royalty is 10%");

        totalSupply++;
        uint256 tokenId = totalSupply;

        tokenOwner[tokenId] = to;
        balanceOf[to]++;

        agentProfiles[tokenId] = AgentProfile({
            ensName: ensName,
            axlEndpoint: axlEndpoint,
            role: role,
            status: IAgent.AgentStatus.IDLE,
            totalCycles: 0,
            mintedAt: block.timestamp
        });

        royalties[tokenId] = RoyaltyInfo({
            recipient: to,
            basisPoints: royaltyBasisPoints,
            totalEarned: 0
        });

        intelligence[tokenId].initialized = false;

        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function embedIntelligence(
        uint256 tokenId,
        bytes32 storageRoot,
        bytes32 encryptedKeyHash,
        string calldata kvNamespace,
        string calldata logNamespace
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) {
        require(!intelligence[tokenId].initialized, "SynapseNFT: Already embedded");
        require(storageRoot != bytes32(0), "SynapseNFT: Invalid storage root");

        intelligence[tokenId] = Intelligence({
            storageRoot: storageRoot,
            encryptedKeyHash: encryptedKeyHash,
            kvNamespace: kvNamespace,
            logNamespace: logNamespace,
            memoryVersion: 1,
            lastUpdated: block.timestamp,
            initialized: true
        });

        emit IntelligenceMinted(tokenId, storageRoot, kvNamespace, block.timestamp);
    }

    function upgradeIntelligence(
        uint256 tokenId,
        bytes32 newStorageRoot,
        bytes32 newEncryptedKeyHash
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) {
        require(intelligence[tokenId].initialized, "SynapseNFT: Not embedded");
        require(newStorageRoot != bytes32(0), "SynapseNFT: Invalid storage root");

        bytes32 oldRoot = intelligence[tokenId].storageRoot;
        uint256 newVersion = intelligence[tokenId].memoryVersion + 1;

        intelligence[tokenId].storageRoot = newStorageRoot;
        intelligence[tokenId].encryptedKeyHash = newEncryptedKeyHash;
        intelligence[tokenId].memoryVersion = newVersion;
        intelligence[tokenId].lastUpdated = block.timestamp;

        emit IntelligenceUpdated(tokenId, oldRoot, newStorageRoot, newVersion, block.timestamp);
    }

    function updateAgentStatus(
        uint256 tokenId,
        IAgent.AgentStatus newStatus
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) {
        agentProfiles[tokenId].status = newStatus;
    }

    function updateAXLEndpoint(
        uint256 tokenId,
        string calldata newEndpoint
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) {
        agentProfiles[tokenId].axlEndpoint = newEndpoint;
    }

    function recordCycle(
        uint256 tokenId
    ) external tokenExists(tokenId) onlyTokenOwner(tokenId) {
        agentProfiles[tokenId].totalCycles++;
        emit AgentCycleCompleted(tokenId, agentProfiles[tokenId].totalCycles, block.timestamp);
    }

    function payRoyalty(uint256 tokenId) external payable tokenExists(tokenId) {
        require(msg.value > 0, "SynapseNFT: No payment sent");
        RoyaltyInfo storage royalty = royalties[tokenId];
        uint256 royaltyAmount = (msg.value * royalty.basisPoints) / 10000;
        royalty.totalEarned += royaltyAmount;
        usageCount[tokenId]++;
        if (royaltyAmount > 0) {
            payable(royalty.recipient).transfer(royaltyAmount);
            emit RoyaltyPaid(tokenId, royalty.recipient, royaltyAmount, block.timestamp);
        }
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external tokenExists(tokenId) {
        require(tokenOwner[tokenId] == from, "SynapseNFT: Wrong owner");
        require(to != address(0), "SynapseNFT: Transfer to zero address");
        require(
            msg.sender == from ||
            tokenApprovals[tokenId] == msg.sender ||
            operatorApprovals[from][msg.sender],
            "SynapseNFT: Not approved"
        );

        bytes32 currentRoot = intelligence[tokenId].storageRoot;
        uint256 currentVersion = intelligence[tokenId].memoryVersion;

        balanceOf[from]--;
        balanceOf[to]++;
        tokenOwner[tokenId] = to;
        royalties[tokenId].recipient = to;
        delete tokenApprovals[tokenId];

        emit Transfer(from, to, tokenId);
        emit IntelligenceTransferred(tokenId, from, to, currentRoot, currentVersion);
    }

    function approve(address to, uint256 tokenId) external tokenExists(tokenId) {
        require(
            tokenOwner[tokenId] == msg.sender ||
            operatorApprovals[tokenOwner[tokenId]][msg.sender],
            "SynapseNFT: Not authorized"
        );
        tokenApprovals[tokenId] = to;
        emit Approval(tokenOwner[tokenId], to, tokenId);
    }

    function getIntelligence(
        uint256 tokenId
    ) external view tokenExists(tokenId) returns (Intelligence memory) {
        return intelligence[tokenId];
    }

    function getAgentProfile(
        uint256 tokenId
    ) external view tokenExists(tokenId) returns (AgentProfile memory) {
        return agentProfiles[tokenId];
    }

    function ownerOf(
        uint256 tokenId
    ) external view tokenExists(tokenId) returns (address) {
        return tokenOwner[tokenId];
    }

    function hasIntelligence(uint256 tokenId) external view returns (bool) {
        return intelligence[tokenId].initialized;
    }

    function getRoyaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    ) external view tokenExists(tokenId) returns (address recipient, uint256 royaltyAmount) {
        RoyaltyInfo memory r = royalties[tokenId];
        return (r.recipient, (salePrice * r.basisPoints) / 10000);
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x80ac58cd ||
            interfaceId == 0x2a55205a ||
            interfaceId == 0x01ffc9a7;
    }
}