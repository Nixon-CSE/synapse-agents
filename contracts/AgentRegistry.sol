// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IAgent.sol";

contract AgentRegistry {

    address public owner;
    uint256 public totalAgents;

    mapping(uint256 => AgentRecord) public agents;
    mapping(string => uint256) public ensToTokenId;
    mapping(address => uint256[]) public ownerToAgents;
    mapping(uint8 => uint256[]) public roleToAgents;
    mapping(uint256 => bool) public isRegistered;

    struct AgentRecord {
        uint256 tokenId;
        string ensName;
        string axlEndpoint;
        IAgent.AgentRole role;
        IAgent.AgentStatus status;
        address owner;
        bytes32 memoryRoot;
        string kvNamespace;
        string logNamespace;
        uint256 totalCycles;
        uint256 registeredAt;
        uint256 lastActiveAt;
        bool active;
    }

    event AgentRegistered(
        uint256 indexed tokenId,
        string ensName,
        IAgent.AgentRole role,
        address indexed owner,
        uint256 timestamp
    );

    event AgentStatusUpdated(
        uint256 indexed tokenId,
        IAgent.AgentStatus oldStatus,
        IAgent.AgentStatus newStatus,
        uint256 timestamp
    );

    event AgentMemoryUpdated(
        uint256 indexed tokenId,
        bytes32 oldMemoryRoot,
        bytes32 newMemoryRoot,
        uint256 timestamp
    );

    event AgentAXLUpdated(
        uint256 indexed tokenId,
        string oldEndpoint,
        string newEndpoint,
        uint256 timestamp
    );

    event CycleRecorded(
        uint256 indexed tokenId,
        uint256 totalCycles,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Registry: Not owner");
        _;
    }

    modifier onlyAgentOwner(uint256 tokenId) {
        require(agents[tokenId].owner == msg.sender, "Registry: Not agent owner");
        _;
    }

    modifier agentExists(uint256 tokenId) {
        require(isRegistered[tokenId], "Registry: Agent not found");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalAgents = 0;
    }

    function registerAgent(
        uint256 tokenId,
        string calldata ensName,
        string calldata axlEndpoint,
        IAgent.AgentRole role,
        string calldata kvNamespace,
        string calldata logNamespace
    ) external {
        require(!isRegistered[tokenId], "Registry: Already registered");
        require(bytes(ensName).length > 0, "Registry: ENS name required");
        require(bytes(axlEndpoint).length > 0, "Registry: AXL endpoint required");
        require(ensToTokenId[ensName] == 0, "Registry: ENS name taken");

        agents[tokenId] = AgentRecord({
            tokenId: tokenId,
            ensName: ensName,
            axlEndpoint: axlEndpoint,
            role: role,
            status: IAgent.AgentStatus.IDLE,
            owner: msg.sender,
            memoryRoot: bytes32(0),
            kvNamespace: kvNamespace,
            logNamespace: logNamespace,
            totalCycles: 0,
            registeredAt: block.timestamp,
            lastActiveAt: block.timestamp,
            active: true
        });

        ensToTokenId[ensName] = tokenId;
        ownerToAgents[msg.sender].push(tokenId);
        roleToAgents[uint8(role)].push(tokenId);
        isRegistered[tokenId] = true;
        totalAgents++;

        emit AgentRegistered(tokenId, ensName, role, msg.sender, block.timestamp);
    }

    function updateAgentStatus(
        uint256 tokenId,
        IAgent.AgentStatus newStatus
    ) external agentExists(tokenId) onlyAgentOwner(tokenId) {
        IAgent.AgentStatus oldStatus = agents[tokenId].status;
        agents[tokenId].status = newStatus;
        agents[tokenId].lastActiveAt = block.timestamp;
        emit AgentStatusUpdated(tokenId, oldStatus, newStatus, block.timestamp);
    }

    function updateAgentMemory(
        uint256 tokenId,
        bytes32 newMemoryRoot,
        string calldata newKvNamespace,
        string calldata newLogNamespace
    ) external agentExists(tokenId) onlyAgentOwner(tokenId) {
        bytes32 oldRoot = agents[tokenId].memoryRoot;
        agents[tokenId].memoryRoot = newMemoryRoot;
        agents[tokenId].kvNamespace = newKvNamespace;
        agents[tokenId].logNamespace = newLogNamespace;
        agents[tokenId].lastActiveAt = block.timestamp;
        emit AgentMemoryUpdated(tokenId, oldRoot, newMemoryRoot, block.timestamp);
    }

    function updateAXLEndpoint(
        uint256 tokenId,
        string calldata newEndpoint
    ) external agentExists(tokenId) onlyAgentOwner(tokenId) {
        string memory oldEndpoint = agents[tokenId].axlEndpoint;
        agents[tokenId].axlEndpoint = newEndpoint;
        emit AgentAXLUpdated(tokenId, oldEndpoint, newEndpoint, block.timestamp);
    }

    function recordCycle(
        uint256 tokenId
    ) external agentExists(tokenId) onlyAgentOwner(tokenId) {
        agents[tokenId].totalCycles++;
        agents[tokenId].lastActiveAt = block.timestamp;
        emit CycleRecorded(tokenId, agents[tokenId].totalCycles, block.timestamp);
    }

    function getAgent(
        uint256 tokenId
    ) external view agentExists(tokenId) returns (AgentRecord memory) {
        return agents[tokenId];
    }

    function getAgentByENS(
        string calldata ensName
    ) external view returns (uint256) {
        uint256 tokenId = ensToTokenId[ensName];
        require(isRegistered[tokenId], "Registry: ENS not found");
        return tokenId;
    }

    function getAgentsByOwner(
        address _owner
    ) external view returns (uint256[] memory) {
        return ownerToAgents[_owner];
    }

    function getAgentsByRole(
        IAgent.AgentRole role
    ) external view returns (uint256[] memory) {
        return roleToAgents[uint8(role)];
    }

    function getAXLEndpointByENS(
        string calldata ensName
    ) external view returns (string memory) {
        uint256 tokenId = ensToTokenId[ensName];
        require(isRegistered[tokenId], "Registry: ENS not found");
        return agents[tokenId].axlEndpoint;
    }

    function getAgentStatus(
        uint256 tokenId
    ) external view agentExists(tokenId) returns (IAgent.AgentStatus) {
        return agents[tokenId].status;
    }

    function isSwarmActive() external view returns (bool) {
        if (totalAgents < 3) return false;
        uint256[] memory analysts = roleToAgents[uint8(IAgent.AgentRole.ANALYST)];
        uint256[] memory executors = roleToAgents[uint8(IAgent.AgentRole.EXECUTOR)];
        uint256[] memory auditors  = roleToAgents[uint8(IAgent.AgentRole.AUDITOR)];
        return (analysts.length > 0 && executors.length > 0 && auditors.length > 0);
    }
}