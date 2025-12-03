// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../../src/AIOracle.sol";
import "../../../src/StrategyVault.sol";
import "../../../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AIOracleHandler
 * @dev Handler for stateful fuzz testing of AIOracle
 * @notice Tests AI model registration, request submission, and execution
 */
contract AIOracleHandler is Test {
    using ECDSA for bytes32;

    AIOracle public oracle;
    StrategyVault public vault;

    // Test signers
    uint256 internal signer1PrivateKey = 0xA11CE;
    uint256 internal signer2PrivateKey = 0xB0B;
    address internal signer1;
    address internal signer2;

    // Ghost variables
    uint256 public ghost_modelsRegistered;
    uint256 public ghost_requestsSubmitted;
    uint256 public ghost_requestsExecuted;
    uint256 public ghost_successfulExecutions;
    uint256 public ghost_failedExecutions;

    // Request tracking
    bytes32[] public submittedRequests;
    mapping(bytes32 => bool) public requestExecuted;
    mapping(string => uint256) public modelRequestCount;

    // Model names
    string[] public registeredModels;

    // Call counters
    uint256 public registerCalls;
    uint256 public submitCalls;
    uint256 public executeCalls;
    uint256 public failedCalls;

    // SEI Chain ID
    uint256 internal constant SEI_CHAIN_ID = 1328;

    constructor(AIOracle _oracle, StrategyVault _vault) {
        oracle = _oracle;
        vault = _vault;
        signer1 = vm.addr(signer1PrivateKey);
        signer2 = vm.addr(signer2PrivateKey);
    }

    modifier ensureSEIChain() {
        vm.chainId(SEI_CHAIN_ID);
        _;
    }

    /**
     * @dev Register a new AI model
     * @param modelSeed Seed for generating model name
     * @param useFirstSigner Whether to use first or second signer
     */
    function registerModel(uint256 modelSeed, bool useFirstSigner)
        external
        ensureSEIChain
    {
        string memory modelName = string(abi.encodePacked("model_v", vm.toString(modelSeed % 1000)));

        // Check if model already registered
        (,, bool isActive,,) = oracle.aiModels(modelName);
        if (isActive) return;

        address signer = useFirstSigner ? signer1 : signer2;

        vm.prank(oracle.owner());
        try oracle.registerAIModel(modelName, signer) {
            registerCalls++;
            ghost_modelsRegistered++;
            registeredModels.push(modelName);
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Submit a rebalance request
     * @param tickLowerSeed Seed for tick lower
     * @param tickUpperSeed Seed for tick upper
     * @param confidenceSeed Seed for confidence value
     * @param modelIndex Index of model to use
     */
    function submitRequest(
        uint256 tickLowerSeed,
        uint256 tickUpperSeed,
        uint256 confidenceSeed,
        uint256 modelIndex
    )
        external
        ensureSEIChain
    {
        if (registeredModels.length == 0) return;

        // Select model
        string memory model = registeredModels[modelIndex % registeredModels.length];

        // Get model signer
        (, address modelSigner, bool isActive,,) = oracle.aiModels(model);
        if (!isActive) return;

        // Generate signature and submit
        bytes memory signature = _createSignature(tickLowerSeed, tickUpperSeed, confidenceSeed, modelSigner);

        // Calculate tick values again for the call
        int24 tickLower = int24(int256(bound(tickLowerSeed, 0, 887270)) - 443635);
        int24 tickUpper = int24(int256(bound(tickUpperSeed, uint256(int256(tickLower)) + 444635, 887272)));
        uint256 confidence = bound(confidenceSeed, 1, 10000);
        uint256 deadline = block.timestamp + 1 hours;

        // Submit request
        try oracle.submitRebalanceRequest(
            address(vault),
            tickLower,
            tickUpper,
            confidence,
            deadline,
            model,
            signature
        ) returns (bytes32 requestId) {
            submitCalls++;
            ghost_requestsSubmitted++;
            submittedRequests.push(requestId);
            modelRequestCount[model]++;
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Helper to create signature (reduces stack depth)
     */
    function _createSignature(
        uint256 tickLowerSeed,
        uint256 tickUpperSeed,
        uint256 confidenceSeed,
        address modelSigner
    ) internal returns (bytes memory) {
        int24 tickLower = int24(int256(bound(tickLowerSeed, 0, 887270)) - 443635);
        int24 tickUpper = int24(int256(bound(tickUpperSeed, uint256(int256(tickLower)) + 444635, 887272)));
        uint256 confidence = bound(confidenceSeed, 1, 10000);
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 messageHash = keccak256(abi.encodePacked(
            address(vault),
            tickLower,
            tickUpper,
            confidence,
            deadline
        )).toEthSignedMessageHash();

        uint256 privateKey = modelSigner == signer1 ? signer1PrivateKey : signer2PrivateKey;
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, messageHash);
        return abi.encodePacked(r, s, v);
    }

    /**
     * @dev Execute a pending request
     * @param requestIndex Index of request to execute
     */
    function executeRequest(uint256 requestIndex)
        external
        ensureSEIChain
    {
        if (submittedRequests.length == 0) return;

        bytes32 requestId = submittedRequests[requestIndex % submittedRequests.length];

        // Check if already executed
        if (requestExecuted[requestId]) return;

        // Get model for the request (use first registered model for simplicity)
        if (registeredModels.length == 0) return;
        string memory model = registeredModels[0];

        // Execute
        try oracle.executeRebalanceRequest(requestId, model) returns (bool success) {
            executeCalls++;
            ghost_requestsExecuted++;
            requestExecuted[requestId] = true;

            if (success) {
                ghost_successfulExecutions++;
            } else {
                ghost_failedExecutions++;
            }
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Deactivate a model
     * @param modelIndex Index of model to deactivate
     */
    function deactivateModel(uint256 modelIndex)
        external
        ensureSEIChain
    {
        if (registeredModels.length == 0) return;

        string memory model = registeredModels[modelIndex % registeredModels.length];

        vm.prank(oracle.owner());
        try oracle.deactivateModel(model) {
            // Model deactivated
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Advance time
     * @param timeJump Seconds to advance
     */
    function warpTime(uint256 timeJump) external {
        timeJump = bound(timeJump, 1, 2 hours);
        vm.warp(block.timestamp + timeJump);
    }

    /**
     * @dev Get summary
     */
    function callSummary() external view returns (
        uint256 registers,
        uint256 submits,
        uint256 executes,
        uint256 failed,
        uint256 successful,
        uint256 failedExecs
    ) {
        return (
            registerCalls,
            submitCalls,
            executeCalls,
            failedCalls,
            ghost_successfulExecutions,
            ghost_failedExecutions
        );
    }

    /**
     * @dev Get number of submitted requests
     */
    function getSubmittedRequestCount() external view returns (uint256) {
        return submittedRequests.length;
    }

    /**
     * @dev Get number of registered models
     */
    function getRegisteredModelCount() external view returns (uint256) {
        return registeredModels.length;
    }
}
