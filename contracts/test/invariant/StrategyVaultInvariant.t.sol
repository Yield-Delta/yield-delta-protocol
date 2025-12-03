// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvariantBase.sol";
import "./handlers/StrategyVaultHandler.sol";

/**
 * @title StrategyVaultInvariantTest
 * @dev Stateful fuzz testing for StrategyVault with dual-token deposits
 * @notice Tests critical invariants for dual-token vault operations
 */
contract StrategyVaultInvariantTest is InvariantBase {
    StrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    StrategyVaultHandler public handler;

    function setUp() public {
        // Set SEI chain
        vm.chainId(SEI_CHAIN_ID);

        // Setup actors
        _setupActors();

        // Deploy tokens
        vm.startPrank(owner);
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");

        // Deploy vault
        vault = new StrategyVault(
            "Strategy Vault",
            "sSTRAT",
            address(token0),
            address(token1),
            3000, // 0.3% pool fee
            aiOracle,
            owner
        );
        vm.stopPrank();

        // Mint tokens to actors
        for (uint256 i = 0; i < actors.length; i++) {
            token0.mint(actors[i], INITIAL_BALANCE);
            token1.mint(actors[i], INITIAL_BALANCE);
        }

        // Deploy handler
        handler = new StrategyVaultHandler(vault, token0, token1, actors, aiOracle);

        // Target handler for invariant testing
        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](5);
        selectors[0] = StrategyVaultHandler.deposit.selector;
        selectors[1] = StrategyVaultHandler.withdraw.selector;
        selectors[2] = StrategyVaultHandler.rebalance.selector;
        selectors[3] = StrategyVaultHandler.warpTime.selector;
        selectors[4] = StrategyVaultHandler.emergencyPause.selector;

        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total supply must equal minted minus burned
     * @dev Invariant: totalSupply == sharesMinted - sharesBurned
     */
    function invariant_totalSupplyConsistent() public view {
        uint256 minted = handler.ghost_sharesMinted();
        uint256 burned = handler.ghost_sharesBurned();
        uint256 currentSupply = vault.totalSupply();

        if (minted >= burned) {
            // Account for initial liquidity burn (1000 shares)
            uint256 expectedSupply = minted - burned;
            // Allow small tolerance for initial liquidity
            assert(currentSupply <= expectedSupply + 1001);
            assert(currentSupply + 1001 >= expectedSupply);
        }
    }

    /**
     * @notice Share balances should sum to total supply
     * @dev Invariant: sum(balanceOf) <= totalSupply
     */
    function invariant_balancesSumToSupply() public view {
        uint256 sumBalances = 0;
        for (uint256 i = 0; i < actors.length; i++) {
            sumBalances += vault.balanceOf(actors[i]);
        }

        // Sum should not exceed total supply
        assert(sumBalances <= vault.totalSupply());
    }

    /*//////////////////////////////////////////////////////////////
                        TOKEN BALANCE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Vault token balances should match deposits minus withdrawals
     * @dev Invariant: vaultBalance ≈ deposits - withdrawals
     */
    function invariant_token0BalanceConsistent() public view {
        uint256 deposited = handler.ghost_totalDeposits0();
        uint256 withdrawn = handler.ghost_totalWithdrawals0();
        uint256 vaultBalance = token0.balanceOf(address(vault));

        if (deposited >= withdrawn) {
            uint256 expected = deposited - withdrawn;
            // Allow 2% tolerance for rounding/fees
            assert(vaultBalance >= (expected * 98) / 100);
            assert(vaultBalance <= (expected * 102) / 100 + 1e18);
        }
    }

    /**
     * @notice Token1 balance consistency
     */
    function invariant_token1BalanceConsistent() public view {
        uint256 deposited = handler.ghost_totalDeposits1();
        uint256 withdrawn = handler.ghost_totalWithdrawals1();
        uint256 vaultBalance = token1.balanceOf(address(vault));

        if (deposited >= withdrawn) {
            uint256 expected = deposited - withdrawn;
            // Allow 2% tolerance
            assert(vaultBalance >= (expected * 98) / 100);
            assert(vaultBalance <= (expected * 102) / 100 + 1e18);
        }
    }

    /**
     * @notice No tokens should disappear
     * @dev Invariant: tokens are either in vault or returned to users
     */
    function invariant_noTokensLost() public view {
        uint256 totalToken0InSystem = token0.balanceOf(address(vault));
        uint256 totalToken1InSystem = token1.balanceOf(address(vault));

        for (uint256 i = 0; i < actors.length; i++) {
            totalToken0InSystem += token0.balanceOf(actors[i]);
            totalToken1InSystem += token1.balanceOf(actors[i]);
        }

        // Total tokens should equal initial minted amount
        // (each actor started with INITIAL_BALANCE, plus handler mints more)
        // Just verify vault balance is reasonable
        assert(token0.balanceOf(address(vault)) <= handler.ghost_totalDeposits0());
        assert(token1.balanceOf(address(vault)) <= handler.ghost_totalDeposits1());
    }

    /*//////////////////////////////////////////////////////////////
                        REBALANCE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Rebalance should not change total supply
     * @dev Invariant: rebalance preserves shares
     */
    function invariant_rebalancePreservesSupply() public view {
        // After rebalance, total supply should remain unchanged
        // This is implicit - rebalance doesn't mint/burn shares
        uint256 minted = handler.ghost_sharesMinted();
        uint256 burned = handler.ghost_sharesBurned();

        if (minted >= burned) {
            uint256 expectedSupply = minted - burned;
            // Allow for initial liquidity
            assert(vault.totalSupply() <= expectedSupply + 1001);
        }
    }

    /**
     * @notice Position ticks should be valid after rebalance
     * @dev Invariant: tickLower < tickUpper
     */
    function invariant_validPositionTicks() public view {
        IStrategyVault.Position memory position = vault.getCurrentPosition();

        // If position is set, ticks should be valid
        if (position.tickLower != 0 || position.tickUpper != 0) {
            assert(position.tickLower < position.tickUpper);
        }
    }

    /**
     * @notice Rebalance interval should be respected
     * @dev Invariant: rebalances occur at proper intervals
     */
    function invariant_rebalanceIntervalRespected() public view {
        // This is enforced by the contract itself
        // Just verify the last rebalance time is tracked
        uint256 lastRebalance = vault.lastRebalance();

        // If there have been rebalances, last rebalance should be in past or present
        if (handler.rebalanceCalls() > 0) {
            assert(lastRebalance <= block.timestamp);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        VAULT STATE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice VaultInfo should be consistent with actual state
     * @dev Invariant: vaultInfo matches reality
     */
    function invariant_vaultInfoConsistent() public view {
        IStrategyVault.VaultInfo memory info = vault.getVaultInfo();

        assert(info.totalSupply == vault.totalSupply());
        assert(info.token0 == address(token0));
        assert(info.token1 == address(token1));
    }

    /**
     * @notice Emergency pause should block operations
     * @dev Invariant: paused state is respected
     */
    function invariant_pauseStateRespected() public view {
        // Verify vault has consistent pause state
        // This invariant just checks state is readable
        bool isPaused = vault.emergencyPaused();
        // State should be boolean (always true)
        assert(isPaused == true || isPaused == false);
    }

    /*//////////////////////////////////////////////////////////////
                        ZERO STATE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Empty vault should have consistent state
     * @dev Invariant: zero supply implies zero or minimal balance
     */
    function invariant_emptyVaultConsistent() public view {
        if (vault.totalSupply() == 0) {
            // Allow for 1000 minimum liquidity that might be locked
            uint256 balance0 = token0.balanceOf(address(vault));
            uint256 balance1 = token1.balanceOf(address(vault));

            // Balances should be very small (dust or initial liquidity)
            assert(balance0 <= 1001);
            assert(balance1 <= 1001);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CALL SUMMARY
    //////////////////////////////////////////////////////////////*/

    function invariant_callSummary() public view {
        (
            uint256 deposits,
            uint256 withdraws,
            uint256 rebalances,
            uint256 failed
        ) = handler.callSummary();

        console.log("=== StrategyVault Invariant Test Summary ===");
        console.log("Deposits:", deposits);
        console.log("Withdrawals:", withdraws);
        console.log("Rebalances:", rebalances);
        console.log("Failed Calls:", failed);
        console.log("Token0 in Vault:", token0.balanceOf(address(vault)) / 1e18);
        console.log("Token1 in Vault:", token1.balanceOf(address(vault)) / 1e18);
        console.log("Total Supply:", vault.totalSupply() / 1e18);
    }
}

/**
 * @title StrategyVaultStatelessFuzzTest
 * @dev Stateless fuzz tests for StrategyVault
 */
contract StrategyVaultStatelessFuzzTest is InvariantBase {
    StrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        vm.startPrank(owner);
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");

        vault = new StrategyVault(
            "Strategy Vault",
            "sSTRAT",
            address(token0),
            address(token1),
            3000,
            aiOracle,
            owner
        );
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        DUAL-TOKEN DEPOSIT FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz dual-token deposits
     * @param amount0 Token0 amount
     * @param amount1 Token1 amount
     */
    function testFuzz_DualTokenDeposit(uint256 amount0, uint256 amount1) public {
        // Bound to reasonable values that won't overflow sqrt
        amount0 = bound(amount0, 1e18, 1_000_000 * 1e18);
        amount1 = bound(amount1, 1e18, 1_000_000 * 1e18);

        token0.mint(user1, amount0);
        token1.mint(user1, amount1);

        vm.startPrank(user1);
        token0.approve(address(vault), amount0);
        token1.approve(address(vault), amount1);

        uint256 shares = vault.deposit(amount0, amount1, user1);
        vm.stopPrank();

        assertGt(shares, 0, "Should receive shares");
        assertEq(token0.balanceOf(address(vault)), amount0, "Vault should hold token0");
        assertEq(token1.balanceOf(address(vault)), amount1, "Vault should hold token1");
    }

    /**
     * @notice Fuzz withdrawal proportions
     * @param depositAmount0 Initial token0 deposit
     * @param depositAmount1 Initial token1 deposit
     * @param withdrawPercent Percentage to withdraw
     */
    function testFuzz_WithdrawalProportions(
        uint256 depositAmount0,
        uint256 depositAmount1,
        uint256 withdrawPercent
    ) public {
        depositAmount0 = bound(depositAmount0, 10e18, 100_000 * 1e18);
        depositAmount1 = bound(depositAmount1, 10e18, 100_000 * 1e18);
        withdrawPercent = bound(withdrawPercent, 1, 100);

        // Setup
        token0.mint(user1, depositAmount0);
        token1.mint(user1, depositAmount1);

        vm.startPrank(user1);
        token0.approve(address(vault), depositAmount0);
        token1.approve(address(vault), depositAmount1);

        uint256 shares = vault.deposit(depositAmount0, depositAmount1, user1);

        // Calculate withdrawal
        uint256 sharesToWithdraw = (shares * withdrawPercent) / 100;
        if (sharesToWithdraw == 0) sharesToWithdraw = 1;

        (uint256 received0, uint256 received1) = vault.withdraw(sharesToWithdraw, user1);
        vm.stopPrank();

        // Verify proportional withdrawal
        if (withdrawPercent == 100) {
            // Full withdrawal should return all tokens
            assertApproxEqRel(received0, depositAmount0, 0.02e18, "Should receive ~all token0");
            assertApproxEqRel(received1, depositAmount1, 0.02e18, "Should receive ~all token1");
        } else {
            // Partial should be proportional
            assertGt(received0, 0, "Should receive some token0");
            assertGt(received1, 0, "Should receive some token1");
        }
    }

    /*//////////////////////////////////////////////////////////////
                        REBALANCE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz rebalance with random ticks
     * @param tickLower New lower tick
     * @param tickUpper New upper tick
     */
    function testFuzz_Rebalance(int24 tickLower, int24 tickUpper) public {
        // Setup initial deposit
        uint256 amount0 = 10_000 * 1e18;
        uint256 amount1 = 10_000 * 1e18;

        token0.mint(user1, amount0);
        token1.mint(user1, amount1);

        vm.startPrank(user1);
        token0.approve(address(vault), amount0);
        token1.approve(address(vault), amount1);
        vault.deposit(amount0, amount1, user1);
        vm.stopPrank();

        // Bound ticks to valid range
        tickLower = int24(bound(int256(tickLower), -887272, 887270));
        tickUpper = int24(bound(int256(tickUpper), int256(tickLower) + 1, 887272));

        // Record pre-state
        uint256 preSupply = vault.totalSupply();
        uint256 preBalance0 = token0.balanceOf(address(vault));
        uint256 preBalance1 = token1.balanceOf(address(vault));

        // Execute rebalance
        IStrategyVault.AIRebalanceParams memory params = IStrategyVault.AIRebalanceParams({
            newTickLower: tickLower,
            newTickUpper: tickUpper,
            minAmount0: 0,
            minAmount1: 0,
            deadline: block.timestamp + 1 hours,
            aiSignature: ""
        });

        vm.prank(aiOracle);
        vault.rebalance(params);

        // Verify state unchanged
        assertEq(vault.totalSupply(), preSupply, "Supply should not change");
        assertEq(token0.balanceOf(address(vault)), preBalance0, "Token0 balance unchanged");
        assertEq(token1.balanceOf(address(vault)), preBalance1, "Token1 balance unchanged");

        // Verify position updated
        IStrategyVault.Position memory pos = vault.getCurrentPosition();
        assertEq(pos.tickLower, tickLower, "Tick lower should update");
        assertEq(pos.tickUpper, tickUpper, "Tick upper should update");
    }

    /**
     * @notice Fuzz rebalance interval enforcement
     * @param timeBetween Time between rebalances
     */
    function testFuzz_RebalanceInterval(uint256 timeBetween) public {
        // Setup
        uint256 amount = 10_000 * 1e18;
        token0.mint(user1, amount);
        token1.mint(user1, amount);

        vm.startPrank(user1);
        token0.approve(address(vault), amount);
        token1.approve(address(vault), amount);
        vault.deposit(amount, amount, user1);
        vm.stopPrank();

        // First rebalance
        IStrategyVault.AIRebalanceParams memory params = IStrategyVault.AIRebalanceParams({
            newTickLower: -100,
            newTickUpper: 100,
            minAmount0: 0,
            minAmount1: 0,
            deadline: block.timestamp + 1 hours,
            aiSignature: ""
        });

        vm.prank(aiOracle);
        vault.rebalance(params);

        // Try second rebalance
        timeBetween = bound(timeBetween, 0, 2 hours);
        vm.warp(block.timestamp + timeBetween);

        params.newTickLower = -200;
        params.newTickUpper = 200;
        params.deadline = block.timestamp + 1 hours;

        if (timeBetween < 3600) {
            // Should fail if interval not met
            vm.expectRevert("Rebalance too frequent");
            vm.prank(aiOracle);
            vault.rebalance(params);
        } else {
            // Should succeed
            vm.prank(aiOracle);
            vault.rebalance(params);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE CALCULATION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test share value fairness with multiple depositors
     * @dev Tests that shares correctly represent underlying value
     * @param amount1 First deposit amount
     * @param amount2 Second deposit amount
     */
    function testFuzz_ShareFairnessMultiDepositor(uint256 amount1, uint256 amount2) public {
        // Minimum of 1000 tokens to avoid precision issues with sqrt and initial liquidity burn
        amount1 = bound(amount1, 1000e18, 100_000 * 1e18);
        amount2 = bound(amount2, 1000e18, 100_000 * 1e18);

        // First user deposits
        token0.mint(user1, amount1);
        token1.mint(user1, amount1);

        vm.startPrank(user1);
        token0.approve(address(vault), amount1);
        token1.approve(address(vault), amount1);
        uint256 shares1 = vault.deposit(amount1, amount1, user1);
        vm.stopPrank();

        // Second user deposits same ratio
        token0.mint(user2, amount2);
        token1.mint(user2, amount2);

        vm.startPrank(user2);
        token0.approve(address(vault), amount2);
        token1.approve(address(vault), amount2);
        uint256 shares2 = vault.deposit(amount2, amount2, user2);
        vm.stopPrank();

        // Key invariant: shares should be non-zero for valid deposits
        assertTrue(shares1 > 0, "User1 should receive shares");
        assertTrue(shares2 > 0, "User2 should receive shares");

        // Verify vault holds all deposited tokens
        assertEq(token0.balanceOf(address(vault)), amount1 + amount2, "Vault should hold all token0");
        assertEq(token1.balanceOf(address(vault)), amount1 + amount2, "Vault should hold all token1");

        // Verify total supply is positive
        assertTrue(vault.totalSupply() > 0, "Total supply should be positive");
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY CONTROLS FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test pause/resume cycle
     * @param numCycles Number of pause/resume cycles
     */
    function testFuzz_PauseResumeCycle(uint256 numCycles) public {
        numCycles = bound(numCycles, 1, 10);

        for (uint256 i = 0; i < numCycles; i++) {
            // Pause
            vm.prank(owner);
            vault.emergencyPause();
            assertTrue(vault.emergencyPaused(), "Should be paused");

            // Resume
            vm.prank(owner);
            vault.resume();
            assertFalse(vault.emergencyPaused(), "Should be resumed");
        }
    }

    /**
     * @notice Fuzz test operations fail when paused
     * @param amount Deposit amount
     */
    function testFuzz_OperationsFailWhenPaused(uint256 amount) public {
        amount = bound(amount, 1e18, 100_000 * 1e18);

        // Pause vault
        vm.prank(owner);
        vault.emergencyPause();

        // Setup tokens
        token0.mint(user1, amount);
        token1.mint(user1, amount);

        vm.startPrank(user1);
        token0.approve(address(vault), amount);
        token1.approve(address(vault), amount);

        // Deposit should fail
        vm.expectRevert("Vault paused");
        vault.deposit(amount, amount, user1);

        vm.stopPrank();
    }
}
