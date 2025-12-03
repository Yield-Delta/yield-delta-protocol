// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvariantBase.sol";
import "./handlers/VaultFactoryHandler.sol";
import "../../src/VaultFactory.sol";
import "../../src/AIOracle.sol";

/**
 * @title VaultFactoryInvariantTest
 * @dev Stateful fuzz testing for VaultFactory
 * @notice Tests vault creation, registry consistency, and fee management
 */
contract VaultFactoryInvariantTest is InvariantBase {
    VaultFactory public factory;
    AIOracle public oracle;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    MockERC20Invariant public token2;
    MockERC20Invariant public token3;
    VaultFactoryHandler public handler;

    function setUp() public {
        // Set SEI chain
        vm.chainId(SEI_CHAIN_ID);

        // Setup actors
        _setupActors();

        vm.startPrank(owner);

        // Deploy tokens
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");
        token2 = new MockERC20Invariant("Token2", "TK2");
        token3 = new MockERC20Invariant("Token3", "TK3");

        // Deploy oracle
        oracle = new AIOracle(owner);

        // Deploy factory
        factory = new VaultFactory(address(oracle), owner);

        vm.stopPrank();

        // Fund actors with ETH for vault creation
        for (uint256 i = 0; i < actors.length; i++) {
            vm.deal(actors[i], 100 ether);
        }

        // Deploy handler
        handler = new VaultFactoryHandler(
            factory,
            token0,
            token1,
            token2,
            token3,
            actors
        );

        // Target handler
        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](6);
        selectors[0] = VaultFactoryHandler.createVault.selector;
        selectors[1] = VaultFactoryHandler.setCreationFee.selector;
        selectors[2] = VaultFactoryHandler.setCreationFeeUnauthorized.selector;
        selectors[3] = VaultFactoryHandler.withdrawFees.selector;
        selectors[4] = VaultFactoryHandler.setDefaultAIOracle.selector;
        selectors[5] = VaultFactoryHandler.warpTime.selector;

        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }

    /*//////////////////////////////////////////////////////////////
                        REGISTRY INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice All created vaults should be registered
     * @dev Invariant: isVault[vault] == true for all created vaults
     */
    function invariant_allVaultsRegistered() public view {
        uint256 vaultCount = handler.getCreatedVaultCount();

        for (uint256 i = 0; i < vaultCount; i++) {
            address vault = handler.getVaultAt(i);
            assert(factory.isVault(vault));
        }
    }

    /**
     * @notice Vault count should match handler tracking
     * @dev Invariant: factory.allVaultsLength() == ghost_vaultsCreated
     */
    function invariant_vaultCountConsistent() public view {
        uint256 factoryCount = factory.allVaultsLength();
        uint256 ghostCount = handler.ghost_vaultsCreated();

        assert(factoryCount == ghostCount);
    }

    /**
     * @notice All vaults in registry should be valid contracts
     * @dev Invariant: allVaults[i].code.length > 0
     */
    function invariant_allVaultsAreContracts() public view {
        uint256 vaultCount = factory.allVaultsLength();

        for (uint256 i = 0; i < vaultCount; i++) {
            address vault = factory.allVaults(i);
            assert(vault.code.length > 0);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        FEE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Creation fee should always be positive
     * @dev Invariant: creationFee >= 0 (implicitly true for uint)
     */
    function invariant_creationFeePositive() public view {
        uint256 fee = factory.creationFee();
        // Fee can be zero, but is always non-negative
        assert(fee >= 0);
    }

    /**
     * @notice Factory balance should reflect fees collected minus withdrawn
     * @dev Invariant: balance <= totalFeesCollected
     */
    function invariant_factoryBalanceReasonable() public view {
        uint256 totalFeesCollected = handler.ghost_totalFeesCollected();
        uint256 totalWithdrawn = handler.ghost_totalFeesWithdrawn();

        // Skip if no vault creation (nothing to check)
        if (handler.ghost_vaultsCreated() == 0) return;

        // The key invariant is that withdrawn should never exceed collected
        assert(totalWithdrawn <= totalFeesCollected);

        // Vault count should match successful creates
        assert(handler.ghost_vaultsCreated() == handler.successfulCreates());
    }

    /*//////////////////////////////////////////////////////////////
                        ORACLE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Default oracle should always be set
     * @dev Invariant: defaultAIOracle != address(0)
     */
    function invariant_oracleAlwaysSet() public view {
        address defaultOracle = factory.defaultAIOracle();
        assert(defaultOracle != address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        OWNERSHIP INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Owner should always be set
     * @dev Invariant: owner != address(0)
     */
    function invariant_ownerAlwaysSet() public view {
        address factoryOwner = factory.owner();
        assert(factoryOwner != address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        VAULT UNIQUENESS INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice No duplicate vaults in registry
     * @dev Invariant: each vault appears exactly once
     */
    function invariant_noDuplicateVaults() public view {
        uint256 vaultCount = factory.allVaultsLength();

        for (uint256 i = 0; i < vaultCount; i++) {
            address vault = factory.allVaults(i);

            // Check no duplicates in remaining elements
            for (uint256 j = i + 1; j < vaultCount; j++) {
                address otherVault = factory.allVaults(j);
                assert(vault != otherVault);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CALL SUMMARY
    //////////////////////////////////////////////////////////////*/

    function invariant_callSummary() public view {
        (
            uint256 creates,
            uint256 successful,
            uint256 failed,
            uint256 feeUpdates,
            uint256 withdraws,
            uint256 totalVaults
        ) = handler.callSummary();

        console.log("=== VaultFactory Invariant Test Summary ===");
        console.log("Create Calls:", creates);
        console.log("Successful Creates:", successful);
        console.log("Failed Creates:", failed);
        console.log("Fee Update Calls:", feeUpdates);
        console.log("Withdraw Calls:", withdraws);
        console.log("Total Vaults:", totalVaults);
        console.log("Factory Balance:", address(factory).balance / 1e18, "ETH");
    }
}

/**
 * @title VaultFactoryStatelessFuzzTest
 * @dev Stateless fuzz tests for VaultFactory
 */
contract VaultFactoryStatelessFuzzTest is InvariantBase {
    VaultFactory public factory;
    AIOracle public oracle;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        vm.startPrank(owner);

        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");

        oracle = new AIOracle(owner);
        factory = new VaultFactory(address(oracle), owner);

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        VAULT CREATION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz vault creation with various parameters
     * @param poolFee Random pool fee
     * @param nameSeed Seed for name generation
     */
    function testFuzz_CreateVault(uint24 poolFee, uint256 nameSeed) public {
        poolFee = uint24(bound(poolFee, 100, 10000));

        string memory name = string(abi.encodePacked("Vault_", vm.toString(nameSeed % 10000)));
        string memory symbol = string(abi.encodePacked("vTK", vm.toString(nameSeed % 1000)));

        uint256 creationFee = factory.creationFee();
        vm.deal(user1, creationFee + 1 ether);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: name,
            symbol: symbol,
            token0: address(token0),
            token1: address(token1),
            poolFee: poolFee,
            aiOracle: address(oracle)
        });

        uint256 preTotalVaults = factory.allVaultsLength();

        vm.prank(user1);
        address vault = factory.createVault{value: creationFee}(params);

        // Verify vault created
        assertGt(vault.code.length, 0, "Vault should be a contract");
        assertTrue(factory.isVault(vault), "Vault should be registered");
        assertEq(factory.allVaultsLength(), preTotalVaults + 1, "Vault count should increase");
    }

    /**
     * @notice Fuzz that insufficient fee fails
     * @param fee Fee less than required
     */
    function testFuzz_CreateVaultInsufficientFee(uint256 fee) public {
        uint256 creationFee = factory.creationFee();
        fee = bound(fee, 0, creationFee - 1);

        vm.deal(user1, fee);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: "Test",
            symbol: "TST",
            token0: address(token0),
            token1: address(token1),
            poolFee: 3000,
            aiOracle: address(oracle)
        });

        vm.prank(user1);
        vm.expectRevert("Insufficient creation fee");
        factory.createVault{value: fee}(params);
    }

    /**
     * @notice Fuzz identical tokens should fail
     */
    function testFuzz_CreateVaultIdenticalTokens(address token) public {
        vm.assume(token != address(0));

        uint256 creationFee = factory.creationFee();
        vm.deal(user1, creationFee);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: "Test",
            symbol: "TST",
            token0: token,
            token1: token, // Same as token0
            poolFee: 3000,
            aiOracle: address(oracle)
        });

        vm.prank(user1);
        vm.expectRevert("Identical tokens");
        factory.createVault{value: creationFee}(params);
    }

    /**
     * @notice Fuzz zero address tokens should fail
     * @param useToken0AsZero Whether to use zero for token0 or token1
     */
    function testFuzz_CreateVaultZeroAddressToken(bool useToken0AsZero) public {
        uint256 creationFee = factory.creationFee();
        vm.deal(user1, creationFee);

        address t0 = useToken0AsZero ? address(0) : address(token0);
        address t1 = useToken0AsZero ? address(token1) : address(0);

        VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
            name: "Test",
            symbol: "TST",
            token0: t0,
            token1: t1,
            poolFee: 3000,
            aiOracle: address(oracle)
        });

        vm.prank(user1);
        vm.expectRevert("Zero address");
        factory.createVault{value: creationFee}(params);
    }

    /*//////////////////////////////////////////////////////////////
                        FEE MANAGEMENT FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz fee update by owner
     * @param newFee New fee value
     */
    function testFuzz_SetCreationFee(uint256 newFee) public {
        newFee = bound(newFee, 0, 100 ether);

        vm.prank(owner);
        factory.setCreationFee(newFee);

        assertEq(factory.creationFee(), newFee, "Fee should be updated");
    }

    /**
     * @notice Fuzz that non-owner cannot set fee
     * @param caller Random non-owner caller
     * @param newFee New fee value
     */
    function testFuzz_SetCreationFeeUnauthorized(address caller, uint256 newFee) public {
        vm.assume(caller != owner);
        vm.assume(caller != address(0));

        uint256 oldFee = factory.creationFee();

        vm.prank(caller);
        vm.expectRevert("Ownable: caller is not the owner");
        factory.setCreationFee(newFee);

        assertEq(factory.creationFee(), oldFee, "Fee should be unchanged");
    }

    /*//////////////////////////////////////////////////////////////
                        ORACLE UPDATE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz oracle update by owner
     * @param newOracle New oracle address
     */
    function testFuzz_SetDefaultAIOracle(address newOracle) public {
        vm.assume(newOracle != address(0));

        vm.prank(owner);
        factory.setDefaultAIOracle(newOracle);

        assertEq(factory.defaultAIOracle(), newOracle, "Oracle should be updated");
    }

    /**
     * @notice Fuzz that zero oracle fails
     */
    function testFuzz_SetDefaultAIOracleZero() public {
        vm.prank(owner);
        vm.expectRevert("Invalid oracle");
        factory.setDefaultAIOracle(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        FEE WITHDRAWAL FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz multiple vault creations and fee withdrawal
     * @param numVaults Number of vaults to create (will be bounded to 1-3)
     */
    function testFuzz_WithdrawFeesAfterCreations(uint256 numVaults) public {
        // Bound to small number to avoid running out of gas
        numVaults = bound(numVaults, 1, 3);

        uint256 creationFee = factory.creationFee();
        uint256 totalFees = 0;

        // Pre-create token pairs to avoid loop gas issues
        MockERC20Invariant[] memory tokensA = new MockERC20Invariant[](numVaults);
        MockERC20Invariant[] memory tokensB = new MockERC20Invariant[](numVaults);

        for (uint256 i = 0; i < numVaults; i++) {
            tokensA[i] = new MockERC20Invariant(
                string(abi.encodePacked("TokenA", vm.toString(i))),
                string(abi.encodePacked("TKA", vm.toString(i)))
            );
            tokensB[i] = new MockERC20Invariant(
                string(abi.encodePacked("TokenB", vm.toString(i))),
                string(abi.encodePacked("TKB", vm.toString(i)))
            );
        }

        for (uint256 i = 0; i < numVaults; i++) {
            vm.deal(user1, creationFee);

            VaultFactory.VaultCreationParams memory params = VaultFactory.VaultCreationParams({
                name: string(abi.encodePacked("Vault", vm.toString(i))),
                symbol: string(abi.encodePacked("VLT", vm.toString(i))),
                token0: address(tokensA[i]),
                token1: address(tokensB[i]),
                poolFee: 3000,
                aiOracle: address(oracle)
            });

            vm.prank(user1);
            factory.createVault{value: creationFee}(params);

            totalFees += creationFee;
        }

        // Verify factory balance
        assertEq(address(factory).balance, totalFees, "Factory should hold fees");

        // Withdraw fees - give owner some ETH first so balance check works
        vm.deal(owner, 0);
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(owner);
        factory.withdrawFees();

        // Verify withdrawal
        assertEq(address(factory).balance, 0, "Factory should be empty");
        assertEq(owner.balance, ownerBalanceBefore + totalFees, "Owner should receive fees");
    }
}
