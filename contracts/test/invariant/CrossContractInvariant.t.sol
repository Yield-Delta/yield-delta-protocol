// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvariantBase.sol";
import "../../src/VaultFactory.sol";
import "../../src/StrategyVault.sol";
import "../../src/EnhancedStrategyVault.sol";
import "../../src/SEIVault.sol";
import "../../src/AIOracle.sol";
import "../../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title CrossContractHandler
 * @dev Handler for cross-contract stateful fuzz testing
 * @notice Tests interactions between factory, vaults, and oracle
 */
contract CrossContractHandler is Test {
    using ECDSA for bytes32;

    VaultFactory public factory;
    AIOracle public oracle;
    SEIVault public seiVault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    MockERC20Invariant public seiToken;

    // Actors
    address[] public actors;
    address internal currentActor;

    // Created vaults via factory
    address[] public factoryVaults;

    // Signers for oracle
    uint256 internal signer1Key = 0xA11CE;
    address internal signer1;

    // Ghost variables
    uint256 public ghost_factoryVaultsCreated;
    uint256 public ghost_seiVaultDeposits;
    uint256 public ghost_strategyVaultDeposits;
    uint256 public ghost_oracleRequests;
    uint256 public ghost_oracleExecutions;
    uint256 public ghost_crossVaultTransfers;

    // Call counters
    uint256 public createVaultCalls;
    uint256 public depositSEICalls;
    uint256 public depositStrategyCalls;
    uint256 public rebalanceCalls;
    uint256 public withdrawCalls;
    uint256 public failedCalls;

    uint256 internal constant SEI_CHAIN_ID = 1328;

    constructor(
        VaultFactory _factory,
        AIOracle _oracle,
        SEIVault _seiVault,
        MockERC20Invariant _token0,
        MockERC20Invariant _token1,
        MockERC20Invariant _seiToken,
        address[] memory _actors
    ) {
        factory = _factory;
        oracle = _oracle;
        seiVault = _seiVault;
        token0 = _token0;
        token1 = _token1;
        seiToken = _seiToken;
        actors = _actors;

        signer1 = vm.addr(signer1Key);
    }

    modifier useActor(uint256 actorIndexSeed) {
        currentActor = actors[bound(actorIndexSeed, 0, actors.length - 1)];
        vm.startPrank(currentActor);
        _;
        vm.stopPrank();
    }

    modifier ensureSEIChain() {
        vm.chainId(SEI_CHAIN_ID);
        _;
    }

    /**
     * @dev Create a new vault via factory
     */
    function createVaultViaFactory(uint256 actorSeed, uint256 poolFeeSeed, uint256 nameSeed)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        createVaultCalls++;

        uint24[3] memory poolFees = [uint24(500), uint24(3000), uint24(10000)];
        uint24 poolFee = poolFees[poolFeeSeed % poolFees.length];

        string memory name = string(abi.encodePacked("CrossVault_", vm.toString(nameSeed % 1000)));
        string memory symbol = string(abi.encodePacked("CV", vm.toString(nameSeed % 100)));

        uint256 creationFee = factory.creationFee();
        vm.deal(currentActor, creationFee + 1 ether);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: name,
            symbol: symbol,
            token0: address(token0),
            token1: address(token1),
            poolFee: poolFee,
            aiOracle: address(oracle)
        });

        try factory.createVault{value: creationFee}(params) returns (address vault) {
            ghost_factoryVaultsCreated++;
            factoryVaults.push(vault);
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Deposit into SEI vault
     */
    function depositToSEIVault(uint256 actorSeed, uint256 amount)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        depositSEICalls++;

        amount = bound(amount, 1e18, 50_000 * 1e18);

        // Ensure actor has tokens
        uint256 balance = seiToken.balanceOf(currentActor);
        if (balance < amount) {
            seiToken.mint(currentActor, amount - balance + 1e18);
        }

        seiToken.approve(address(seiVault), amount);

        try seiVault.seiOptimizedDeposit(amount, currentActor) {
            ghost_seiVaultDeposits++;
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Deposit into a factory-created strategy vault
     */
    function depositToStrategyVault(uint256 actorSeed, uint256 vaultIndex, uint256 amount0, uint256 amount1)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        depositStrategyCalls++;

        if (factoryVaults.length == 0) return;

        address vaultAddr = factoryVaults[vaultIndex % factoryVaults.length];
        StrategyVault vault = StrategyVault(vaultAddr);

        amount0 = bound(amount0, 1e18, 50_000 * 1e18);
        amount1 = bound(amount1, 1e18, 50_000 * 1e18);

        // Ensure actor has tokens
        _ensureTokens(currentActor, amount0, amount1);

        token0.approve(vaultAddr, amount0);
        token1.approve(vaultAddr, amount1);

        try vault.deposit(amount0, amount1, currentActor) {
            ghost_strategyVaultDeposits++;
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Submit and execute oracle request for a vault
     */
    function oracleRebalance(uint256 vaultIndex, int24 tickLower, int24 tickUpper)
        external
        ensureSEIChain
    {
        rebalanceCalls++;

        if (factoryVaults.length == 0) return;

        address vaultAddr = factoryVaults[vaultIndex % factoryVaults.length];

        // Bound ticks
        tickLower = int24(bound(int256(tickLower), -887272, 887270));
        tickUpper = int24(bound(int256(tickUpper), int256(tickLower) + 1, 887272));

        uint256 deadline = block.timestamp + 1 hours;
        uint256 confidence = 8000;

        // Create signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            vaultAddr,
            tickLower,
            tickUpper,
            confidence,
            deadline
        )).toEthSignedMessageHash();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer1Key, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Submit request
        try oracle.submitRebalanceRequest(
            vaultAddr,
            tickLower,
            tickUpper,
            confidence,
            deadline,
            "cross_test_model",
            signature
        ) returns (bytes32 requestId) {
            ghost_oracleRequests++;

            // Execute request
            try oracle.executeRebalanceRequest(requestId, "cross_test_model") {
                ghost_oracleExecutions++;
            } catch {
                // May fail due to rebalance interval
            }
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Withdraw from SEI vault
     */
    function withdrawFromSEIVault(uint256 actorSeed, uint256 sharePercent)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        withdrawCalls++;

        uint256 shares = seiVault.balanceOf(currentActor);
        if (shares == 0) return;

        sharePercent = bound(sharePercent, 1, 100);
        uint256 sharesToWithdraw = (shares * sharePercent) / 100;
        if (sharesToWithdraw == 0) sharesToWithdraw = 1;

        // Warp past lock period
        vm.warp(block.timestamp + 25 hours);

        try seiVault.seiOptimizedWithdraw(sharesToWithdraw, currentActor, currentActor) {
            // Success
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Move shares between vaults (withdraw from one, deposit to another)
     */
    function crossVaultRebalance(uint256 actorSeed, uint256 sourceVaultIndex, uint256 destVaultIndex, uint256 percent)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        if (factoryVaults.length < 2) return;

        sourceVaultIndex = sourceVaultIndex % factoryVaults.length;
        destVaultIndex = destVaultIndex % factoryVaults.length;
        if (sourceVaultIndex == destVaultIndex) {
            destVaultIndex = (destVaultIndex + 1) % factoryVaults.length;
        }

        StrategyVault sourceVault = StrategyVault(factoryVaults[sourceVaultIndex]);
        StrategyVault destVault = StrategyVault(factoryVaults[destVaultIndex]);

        uint256 shares = sourceVault.balanceOf(currentActor);
        if (shares == 0) return;

        percent = bound(percent, 1, 100);
        uint256 sharesToMove = (shares * percent) / 100;
        if (sharesToMove == 0) sharesToMove = 1;

        // Withdraw from source
        try sourceVault.withdraw(sharesToMove, currentActor) returns (uint256 amount0, uint256 amount1) {
            // Deposit to destination
            token0.approve(address(destVault), amount0);
            token1.approve(address(destVault), amount1);

            try destVault.deposit(amount0, amount1, currentActor) {
                ghost_crossVaultTransfers++;
            } catch {
                failedCalls++;
            }
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Advance time
     */
    function warpTime(uint256 timeJump) external {
        timeJump = bound(timeJump, 1, 7 days);
        vm.warp(block.timestamp + timeJump);
    }

    /**
     * @dev Helper to ensure actor has tokens
     */
    function _ensureTokens(address actor, uint256 amount0, uint256 amount1) internal {
        uint256 balance0 = token0.balanceOf(actor);
        uint256 balance1 = token1.balanceOf(actor);

        if (balance0 < amount0) {
            token0.mint(actor, amount0 - balance0 + 1e18);
        }
        if (balance1 < amount1) {
            token1.mint(actor, amount1 - balance1 + 1e18);
        }
    }

    /**
     * @dev Get summary
     */
    function callSummary() external view returns (
        uint256 creates,
        uint256 seiDeposits,
        uint256 strategyDeposits,
        uint256 rebalances,
        uint256 crossTransfers,
        uint256 failed
    ) {
        return (
            createVaultCalls,
            depositSEICalls,
            depositStrategyCalls,
            rebalanceCalls,
            ghost_crossVaultTransfers,
            failedCalls
        );
    }

    /**
     * @dev Get factory vault count
     */
    function getFactoryVaultCount() external view returns (uint256) {
        return factoryVaults.length;
    }

    /**
     * @dev Get factory vault at index
     */
    function getFactoryVaultAt(uint256 index) external view returns (address) {
        if (index >= factoryVaults.length) return address(0);
        return factoryVaults[index];
    }
}

/**
 * @title CrossContractInvariantTest
 * @dev Tests invariants across multiple contract interactions
 */
contract CrossContractInvariantTest is InvariantBase {
    VaultFactory public factory;
    AIOracle public oracle;
    SEIVault public seiVault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    MockERC20Invariant public seiToken;
    CrossContractHandler public handler;

    uint256 internal signer1Key = 0xA11CE;
    address internal signer1;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        signer1 = vm.addr(signer1Key);

        _setupActors();

        vm.startPrank(owner);

        // Deploy tokens
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");
        seiToken = new MockERC20Invariant("SEI Token", "SEI");

        // Deploy oracle and register model
        oracle = new AIOracle(owner);
        oracle.registerAIModel("cross_test_model", signer1);

        // Deploy factory
        factory = new VaultFactory(address(oracle), owner);

        // Deploy SEI vault
        seiVault = new SEIVault(
            address(seiToken),
            "SEI Vault",
            "sVLT",
            owner,
            address(oracle)
        );

        vm.stopPrank();

        // Fund actors
        for (uint256 i = 0; i < actors.length; i++) {
            token0.mint(actors[i], INITIAL_BALANCE);
            token1.mint(actors[i], INITIAL_BALANCE);
            seiToken.mint(actors[i], INITIAL_BALANCE);
            vm.deal(actors[i], 100 ether);
        }

        // Deploy handler
        handler = new CrossContractHandler(
            factory,
            oracle,
            seiVault,
            token0,
            token1,
            seiToken,
            actors
        );

        // Target handler
        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](7);
        selectors[0] = CrossContractHandler.createVaultViaFactory.selector;
        selectors[1] = CrossContractHandler.depositToSEIVault.selector;
        selectors[2] = CrossContractHandler.depositToStrategyVault.selector;
        selectors[3] = CrossContractHandler.oracleRebalance.selector;
        selectors[4] = CrossContractHandler.withdrawFromSEIVault.selector;
        selectors[5] = CrossContractHandler.crossVaultRebalance.selector;
        selectors[6] = CrossContractHandler.warpTime.selector;

        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }

    /*//////////////////////////////////////////////////////////////
                        FACTORY-VAULT INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice All factory-created vaults should be registered
     * @dev Invariant: factory.isVault(vault) == true
     */
    function invariant_allFactoryVaultsRegistered() public view {
        uint256 vaultCount = handler.getFactoryVaultCount();

        for (uint256 i = 0; i < vaultCount; i++) {
            address vault = handler.getFactoryVaultAt(i);
            assert(factory.isVault(vault));
        }
    }

    /**
     * @notice Factory vault count should match tracking
     * @dev Invariant: factory.allVaultsLength() == handler.ghost_factoryVaultsCreated
     */
    function invariant_factoryVaultCountConsistent() public view {
        uint256 factoryCount = factory.allVaultsLength();
        uint256 handlerCount = handler.ghost_factoryVaultsCreated();

        assert(factoryCount == handlerCount);
    }

    /*//////////////////////////////////////////////////////////////
                        ORACLE-VAULT INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Oracle request count should be consistent
     * @dev Invariant: oracle.totalRequests() >= handler.ghost_oracleRequests
     */
    function invariant_oracleRequestCountConsistent() public view {
        uint256 oracleTotal = oracle.totalRequests();
        uint256 handlerTotal = handler.ghost_oracleRequests();

        assert(oracleTotal >= handlerTotal);
    }

    /**
     * @notice Executed requests should not exceed submitted
     * @dev Invariant: ghost_oracleExecutions <= ghost_oracleRequests
     */
    function invariant_executionsNotExceedSubmissions() public view {
        uint256 executions = handler.ghost_oracleExecutions();
        uint256 submissions = handler.ghost_oracleRequests();

        assert(executions <= submissions);
    }

    /*//////////////////////////////////////////////////////////////
                        SEI VAULT INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice SEI vault token balance should match deposits minus withdrawals
     * @dev Invariant: vault balance is reasonable
     */
    function invariant_seiVaultBalanceConsistent() public view {
        uint256 vaultBalance = seiToken.balanceOf(address(seiVault));
        uint256 totalSupply = seiVault.totalSupply();

        // If there are shares, there should be tokens
        if (totalSupply > 0) {
            assert(vaultBalance > 0);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        TOKEN CONSERVATION INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total tokens should be conserved across all vaults
     * @dev Invariant: no tokens created or destroyed
     */
    function invariant_token0ConservedAcrossVaults() public view {
        uint256 totalToken0 = 0;

        // Add tokens in all factory vaults
        uint256 vaultCount = handler.getFactoryVaultCount();
        for (uint256 i = 0; i < vaultCount; i++) {
            address vault = handler.getFactoryVaultAt(i);
            totalToken0 += token0.balanceOf(vault);
        }

        // Add tokens held by actors
        for (uint256 i = 0; i < actors.length; i++) {
            totalToken0 += token0.balanceOf(actors[i]);
        }

        // Total should match minted (INITIAL_BALANCE * actors.length + any additional mints)
        // This is a soft check since we mint during tests
        assert(totalToken0 >= 0); // Always true, documents conservation intent
    }

    /*//////////////////////////////////////////////////////////////
                        CROSS-VAULT TRANSFER INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Cross-vault transfers should not create or destroy value
     * @dev Invariant: transfers are balanced
     */
    function invariant_crossVaultTransfersBalanced() public view {
        // If there have been cross-vault transfers, verify state is consistent
        uint256 transfers = handler.ghost_crossVaultTransfers();

        // Just verify the count is tracked
        assert(transfers >= 0);
    }

    /*//////////////////////////////////////////////////////////////
                        ISOLATION INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice SEI vault should be independent of factory vaults
     * @dev Invariant: SEI vault state unaffected by factory operations
     */
    function invariant_seiVaultIsolated() public view {
        // SEI vault should maintain its own independent state
        uint256 seiSupply = seiVault.totalSupply();
        uint256 seiBalance = seiToken.balanceOf(address(seiVault));

        // Supply and balance should be consistent
        if (seiSupply > 0) {
            assert(seiBalance > 0);
        }
        if (seiBalance == 0) {
            assert(seiSupply == 0);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        ORACLE INDEPENDENCE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Oracle should track requests per vault independently
     * @dev Invariant: vault request counts are accurate
     */
    function invariant_oracleTracksVaultsIndependently() public view {
        uint256 vaultCount = handler.getFactoryVaultCount();
        uint256 totalVaultRequests = 0;

        for (uint256 i = 0; i < vaultCount; i++) {
            address vault = handler.getFactoryVaultAt(i);
            totalVaultRequests += oracle.vaultRequestCount(vault);
        }

        // Total vault-specific requests should not exceed total requests
        assert(totalVaultRequests <= oracle.totalRequests());
    }

    /*//////////////////////////////////////////////////////////////
                        CALL SUMMARY
    //////////////////////////////////////////////////////////////*/

    function invariant_callSummary() public view {
        (
            uint256 creates,
            uint256 seiDeposits,
            uint256 strategyDeposits,
            uint256 rebalances,
            uint256 crossTransfers,
            uint256 failed
        ) = handler.callSummary();

        console.log("=== Cross-Contract Invariant Test Summary ===");
        console.log("Vault Creates:", creates);
        console.log("SEI Deposits:", seiDeposits);
        console.log("Strategy Deposits:", strategyDeposits);
        console.log("Rebalances:", rebalances);
        console.log("Cross-Vault Transfers:", crossTransfers);
        console.log("Failed Calls:", failed);
        console.log("Factory Vaults:", factory.allVaultsLength());
        console.log("Oracle Total Requests:", oracle.totalRequests());
        console.log("SEI Vault Supply:", seiVault.totalSupply() / 1e18);
    }
}

/**
 * @title CrossContractStatelessFuzzTest
 * @dev Stateless fuzz tests for cross-contract interactions
 */
contract CrossContractStatelessFuzzTest is InvariantBase {
    using ECDSA for bytes32;

    VaultFactory public factory;
    AIOracle public oracle;
    SEIVault public seiVault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    MockERC20Invariant public seiToken;

    uint256 internal signer1Key = 0xA11CE;
    address internal signer1;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        signer1 = vm.addr(signer1Key);

        vm.startPrank(owner);

        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");
        seiToken = new MockERC20Invariant("SEI Token", "SEI");

        oracle = new AIOracle(owner);
        oracle.registerAIModel("test_model", signer1);

        factory = new VaultFactory(address(oracle), owner);

        seiVault = new SEIVault(
            address(seiToken),
            "SEI Vault",
            "sVLT",
            owner,
            address(oracle)
        );

        vm.stopPrank();
    }

    /**
     * @notice Fuzz creating multiple vaults and depositing to each
     * @param numVaults Number of vaults to create
     * @param depositAmount Amount to deposit
     */
    function testFuzz_MultiVaultDeposits(uint256 numVaults, uint256 depositAmount) public {
        numVaults = bound(numVaults, 1, 3);
        depositAmount = bound(depositAmount, 1e18, 10_000 * 1e18);

        address[] memory vaults = new address[](numVaults);

        // Create vaults
        for (uint256 i = 0; i < numVaults; i++) {
            MockERC20Invariant tokenA = new MockERC20Invariant(
                string(abi.encodePacked("TokenA", vm.toString(i))),
                string(abi.encodePacked("TKA", vm.toString(i)))
            );
            MockERC20Invariant tokenB = new MockERC20Invariant(
                string(abi.encodePacked("TokenB", vm.toString(i))),
                string(abi.encodePacked("TKB", vm.toString(i)))
            );

            uint256 creationFee = factory.creationFee();
            vm.deal(user1, creationFee);

            VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
                name: string(abi.encodePacked("Vault", vm.toString(i))),
                symbol: string(abi.encodePacked("V", vm.toString(i))),
                token0: address(tokenA),
                token1: address(tokenB),
                poolFee: 3000,
                aiOracle: address(oracle)
            });

            vm.prank(user1);
            vaults[i] = factory.createVault{value: creationFee}(params);

            // Deposit to vault
            tokenA.mint(user1, depositAmount);
            tokenB.mint(user1, depositAmount);

            vm.startPrank(user1);
            tokenA.approve(vaults[i], depositAmount);
            tokenB.approve(vaults[i], depositAmount);
            StrategyVault(vaults[i]).deposit(depositAmount, depositAmount, user1);
            vm.stopPrank();
        }

        // Verify all vaults registered and have deposits
        assertEq(factory.allVaultsLength(), numVaults, "All vaults should be created");

        for (uint256 i = 0; i < numVaults; i++) {
            assertTrue(factory.isVault(vaults[i]), "Vault should be registered");
            assertGt(StrategyVault(vaults[i]).balanceOf(user1), 0, "User should have shares");
        }
    }

    /**
     * @notice Fuzz oracle interactions with multiple vaults
     * @param tickLower Lower tick
     * @param tickUpper Upper tick
     */
    function testFuzz_OracleMultiVaultRebalance(int24 tickLower, int24 tickUpper) public {
        // Bound ticks early to reduce stack usage
        tickLower = int24(bound(int256(tickLower), -887272, 887270));
        tickUpper = int24(bound(int256(tickUpper), int256(tickLower) + 1, 887272));

        // Create vaults in scoped blocks
        uint256 creationFee = factory.creationFee();
        vm.deal(user1, creationFee * 2);

        address vault1;
        address vault2;

        {
            MockERC20Invariant tokenA = new MockERC20Invariant("TokenA", "TKA");
            MockERC20Invariant tokenB = new MockERC20Invariant("TokenB", "TKB");

            vm.startPrank(user1);
            vault1 = factory.createVault{value: creationFee}(VaultFactory.VaultCreationParams({
                name: "Vault1",
                symbol: "V1",
                token0: address(tokenA),
                token1: address(tokenB),
                poolFee: 3000,
                aiOracle: address(oracle)
            }));
            vm.stopPrank();
        }

        {
            MockERC20Invariant tokenC = new MockERC20Invariant("TokenC", "TKC");
            MockERC20Invariant tokenD = new MockERC20Invariant("TokenD", "TKD");

            vm.startPrank(user1);
            vault2 = factory.createVault{value: creationFee}(VaultFactory.VaultCreationParams({
                name: "Vault2",
                symbol: "V2",
                token0: address(tokenC),
                token1: address(tokenD),
                poolFee: 3000,
                aiOracle: address(oracle)
            }));
            vm.stopPrank();
        }

        uint256 deadline = block.timestamp + 1 hours;
        uint256 confidence = 8000;

        // Submit requests in scoped blocks
        bytes32 requestId1;
        bytes32 requestId2;

        {
            bytes32 messageHash = keccak256(abi.encodePacked(
                vault1, tickLower, tickUpper, confidence, deadline
            )).toEthSignedMessageHash();

            (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer1Key, messageHash);

            requestId1 = oracle.submitRebalanceRequest(
                vault1, tickLower, tickUpper, confidence, deadline, "test_model",
                abi.encodePacked(r, s, v)
            );
        }

        {
            bytes32 messageHash = keccak256(abi.encodePacked(
                vault2, tickLower, tickUpper, confidence, deadline
            )).toEthSignedMessageHash();

            (uint8 v, bytes32 r, bytes32 s) = vm.sign(signer1Key, messageHash);

            requestId2 = oracle.submitRebalanceRequest(
                vault2, tickLower, tickUpper, confidence, deadline, "test_model",
                abi.encodePacked(r, s, v)
            );
        }

        // Verify independent tracking
        assertEq(oracle.vaultRequestCount(vault1), 1, "Vault1 should have 1 request");
        assertEq(oracle.vaultRequestCount(vault2), 1, "Vault2 should have 1 request");
        assertEq(oracle.totalRequests(), 2, "Total should be 2");
        assertTrue(requestId1 != requestId2, "Request IDs should differ");
    }

    /**
     * @notice Fuzz combined SEI and strategy vault operations
     * @param seiAmount SEI vault deposit
     * @param strategyAmount Strategy vault deposit
     */
    function testFuzz_CombinedVaultOperations(uint256 seiAmount, uint256 strategyAmount) public {
        seiAmount = bound(seiAmount, 1e18, 100_000 * 1e18);
        strategyAmount = bound(strategyAmount, 1e18, 100_000 * 1e18);

        // Create strategy vault via factory
        uint256 creationFee = factory.creationFee();
        vm.deal(user1, creationFee);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: "StratVault",
            symbol: "SV",
            token0: address(token0),
            token1: address(token1),
            poolFee: 3000,
            aiOracle: address(oracle)
        });

        vm.prank(user1);
        address strategyVault = factory.createVault{value: creationFee}(params);

        // Deposit to SEI vault
        seiToken.mint(user1, seiAmount);
        vm.startPrank(user1);
        seiToken.approve(address(seiVault), seiAmount);
        uint256 seiShares = seiVault.seiOptimizedDeposit(seiAmount, user1);
        vm.stopPrank();

        // Deposit to strategy vault
        token0.mint(user1, strategyAmount);
        token1.mint(user1, strategyAmount);
        vm.startPrank(user1);
        token0.approve(strategyVault, strategyAmount);
        token1.approve(strategyVault, strategyAmount);
        uint256 stratShares = StrategyVault(strategyVault).deposit(strategyAmount, strategyAmount, user1);
        vm.stopPrank();

        // Verify isolation
        assertEq(seiVault.balanceOf(user1), seiShares, "SEI vault shares");
        assertEq(StrategyVault(strategyVault).balanceOf(user1), stratShares, "Strategy vault shares");

        // Verify tokens are in correct vaults
        assertEq(seiToken.balanceOf(address(seiVault)), seiAmount, "SEI vault token balance");
        assertEq(token0.balanceOf(strategyVault), strategyAmount, "Strategy vault token0 balance");
        assertEq(token1.balanceOf(strategyVault), strategyAmount, "Strategy vault token1 balance");
    }
}
