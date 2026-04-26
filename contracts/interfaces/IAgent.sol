// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IAgent {

    enum AgentStatus {
        IDLE,
        THINKING,
        ACTIVE,
        PAUSED,
        OFFLINE
    }

    enum AgentRole {
        ANALYST,
        EXECUTOR,
        AUDITOR
    }

    struct AgentIdentity {
        uint256 tokenId;
        string ensName;
        string axlEndpoint;
        AgentRole role;
        AgentStatus status;
        address owner;
        uint256 createdAt;
    }

    struct MemoryPointer {
        bytes32 storageRoot;
        string kvNamespace;
        string logNamespace;
        uint256 lastUpdated;
        uint256 memoryVersion;
    }

    event AgentStatusUpdated(
        uint256 indexed tokenId,
        AgentStatus oldStatus,
        AgentStatus newStatus,
        uint256 timestamp
    );

    event MemoryUpdated(
        uint256 indexed tokenId,
        bytes32 oldStorageRoot,
        bytes32 newStorageRoot,
        uint256 version
    );

    event CycleCompleted(
        uint256 indexed tokenId,
        bytes32 cycleId,
        bool success,
        uint256 timestamp
    );

    function getIdentity() external view returns (AgentIdentity memory);
    function getMemoryPointer() external view returns (MemoryPointer memory);
    function getStatus() external view returns (AgentStatus);
    function getENSName() external view returns (string memory);
    function getAXLEndpoint() external view returns (string memory);

    function updateMemoryPointer(
        bytes32 newStorageRoot,
        string calldata newKvNamespace,
        string calldata newLogNamespace
    ) external;

    function updateStatus(AgentStatus newStatus) external;
    function updateAXLEndpoint(string calldata newEndpoint) external;
}