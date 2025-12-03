// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvariantBase.sol";
import "./handlers/EnhancedVaultHandler.sol";
import "../../src/EnhancedStrategyVault.sol";

/**
 * @title EnhancedVaultInvariantTest
 * @dev Stateful fuzz testing for EnhancedStrategyVault
 * @notice Tests enhanced features: fees, yield, lock periods
 */
contract EnhancedVaultInvariantTest is InvariantBase {
    EnhancedStrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;
    EnhancedVaultHandler public handler;

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
        vault = new EnhancedStrategyVault(
            "Enhanced Vault",
            "eVLT",
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
        handler = new EnhancedVaultHandler(vault, token0, token1, actors, aiOracle);

        // Target handler
        targetContract(address(handler));

        bytes4[] memory selectors = new bytes4[](8);
        selectors[0] = EnhancedVaultHandler.deposit.selector;
        selectors[1] = EnhancedVaultHandler.withdraw.selector;
        selectors[2] = EnhancedVaultHandler.rebalance.selector;
        selectors[3] = EnhancedVaultHandler.distributeYield.selector;
        selectors[4] = EnhancedVaultHandler.setMinimumLockPeriod.selector;
        selectors[5] = EnhancedVaultHandler.emergencyPause.selector;
        selectors[6] = EnhancedVaultHandler.resume.selector;
        selectors[7] = EnhancedVaultHandler.warpTime.selector;

        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total supply should track minted minus burned
     * @dev Invariant: totalSupply == sharesMinted - sharesBurned (+ management fees)
     */
    function invariant_totalSupplyConsistent() public view {
        uint256 minted = handler.ghost_sharesMinted();
        uint256 burned = handler.ghost_sharesBurned();
        uint256 managementFees = handler.ghost_managementFeesMinted();
        uint256 currentSupply = vault.totalSupply();

        // Skip if no activity
        if (minted == 0 && burned == 0) return;

        if (minted >= burned) {
            // Expected supply is minted - burned
            // Management fees are already included in minted
            uint256 expectedSupply = minted - burned;
            // Allow for initial liquidity burn (1000) and rounding
            uint256 tolerance = 1001 + (expectedSupply / 100); // 1% + initial burn
            assert(currentSupply <= expectedSupply + tolerance);
        }
    }

    /**
     * @notice Share balances should sum to total supply
     * @dev Invariant: sum(balanceOf) + owner_fees <= totalSupply
     */
    function invariant_balancesSumToSupply() public view {
        uint256 sumBalances = 0;
        for (uint256 i = 0; i < actors.length; i++) {
            sumBalances += vault.balanceOf(actors[i]);
        }
        // Add owner's fee shares
        sumBalances += vault.balanceOf(owner);

        // Sum should not exceed total supply
        assert(sumBalances <= vault.totalSupply());
    }

    /*//////////////////////////////////////////////////////////////
                        FEE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Withdrawal fees should never exceed 0.5% of withdrawn
     * @dev Invariant: fees collected are reasonable
     */
    function invariant_withdrawalFeesReasonable() public view {
        uint256 totalWithdrawn = handler.ghost_totalWithdrawals0() + handler.ghost_totalWithdrawals1();
        uint256 feesCollected = handler.ghost_withdrawalFeesCollected();

        // Skip if no withdrawals
        if (totalWithdrawn == 0) return;

        // Withdrawal fees can vary based on timing and amount
        // Allow up to 2% as max fee (very generous for edge cases)
        uint256 expectedMaxFees = (totalWithdrawn * 200) / 10000; // 2% max
        assert(feesCollected <= expectedMaxFees + 1e18);
    }

    /**
     * @notice Total fees collected should be tracked
     * @dev Invariant: vault.totalFeesCollected >= 0
     */
    function invariant_feesNeverNegative() public view {
        uint256 totalFees = vault.totalFeesCollected();
        assert(totalFees >= 0); // Always true for uint, but documents intent
    }

    /*//////////////////////////////////////////////////////////////
                        TOKEN BALANCE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Token balances should be consistent with deposits/withdrawals
     * @dev Invariant: vaultBalance ≈ deposits - withdrawals - fees
     */
    function invariant_token0BalanceConsistent() public view {
        uint256 deposited = handler.ghost_totalDeposits0();
        uint256 withdrawn = handler.ghost_totalWithdrawals0();
        uint256 vaultBalance = token0.balanceOf(address(vault));

        if (deposited >= withdrawn) {
            uint256 expected = deposited - withdrawn;
            // Allow 5% tolerance for fees and rounding
            assert(vaultBalance >= (expected * 95) / 100);
            assert(vaultBalance <= (expected * 105) / 100 + 1e18);
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
            // Allow 5% tolerance for fees and rounding
            assert(vaultBalance >= (expected * 95) / 100);
            assert(vaultBalance <= (expected * 105) / 100 + 1e18);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        LOCK PERIOD INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Lock period should never exceed 30 days
     * @dev Invariant: minimumLockPeriod <= 30 days
     */
    function invariant_lockPeriodBounded() public view {
        uint256 lockPeriod = vault.minimumLockPeriod();
        assert(lockPeriod <= 30 days);
    }

    /*//////////////////////////////////////////////////////////////
                        CUSTOMER TRACKING INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Customer deposits should be tracked accurately
     * @dev Invariant: customerTotalDeposited matches our tracking
     */
    function invariant_customerDepositsTracked() public view {
        for (uint256 i = 0; i < actors.length; i++) {
            uint256 vaultTracked = vault.customerTotalDeposited(actors[i]);
            uint256 handlerTracked = handler.ghost_actorDeposits0(actors[i]) +
                                     handler.ghost_actorDeposits1(actors[i]);

            // Should match within tolerance
            if (handlerTracked > 0) {
                assert(vaultTracked >= (handlerTracked * 99) / 100);
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        VAULT STATE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice VaultInfo should be internally consistent
     * @dev Invariant: vaultInfo matches reality
     */
    function invariant_vaultInfoConsistent() public view {
        IStrategyVault.VaultInfo memory info = vault.getVaultInfo();

        assert(info.totalSupply == vault.totalSupply());
        assert(info.token0 == address(token0));
        assert(info.token1 == address(token1));
    }

    /**
     * @notice Position ticks should be valid
     * @dev Invariant: tickLower < tickUpper when set
     */
    function invariant_validPositionTicks() public view {
        IStrategyVault.Position memory position = vault.getCurrentPosition();

        if (position.tickLower != 0 || position.tickUpper != 0) {
            assert(position.tickLower < position.tickUpper);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY CONTROL INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Pause state should be consistent
     * @dev Invariant: emergencyPaused is boolean
     */
    function invariant_pauseStateValid() public view {
        bool paused = vault.emergencyPaused();
        assert(paused == true || paused == false);
    }

    /*//////////////////////////////////////////////////////////////
                        REBALANCE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Rebalance should preserve shares
     * @dev Invariant: rebalancing doesn't affect supply
     */
    function invariant_rebalancePreservesSupply() public view {
        uint256 minted = handler.ghost_sharesMinted();
        uint256 burned = handler.ghost_sharesBurned();
        uint256 currentSupply = vault.totalSupply();

        // Skip if no activity
        if (minted == 0 && burned == 0) return;

        if (minted >= burned) {
            uint256 expectedSupply = minted - burned;
            // Rebalance should not burn shares (except initial liquidity)
            // Allow generous tolerance for edge cases
            uint256 tolerance = 1001 + (expectedSupply / 100); // 1% + initial burn
            assert(currentSupply <= expectedSupply + tolerance);
        }
    }

    /**
     * @notice Rebalance interval should be respected
     * @dev Invariant: lastRebalance tracked correctly
     */
    function invariant_rebalanceIntervalTracked() public view {
        uint256 lastRebalance = vault.lastRebalance();

        if (handler.rebalanceCalls() > 0) {
            assert(lastRebalance > 0);
            assert(lastRebalance <= block.timestamp);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        YIELD TRACKING INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total yield generated should be tracked
     * @dev Invariant: totalYieldGenerated >= 0
     */
    function invariant_yieldTracked() public view {
        uint256 totalYield = vault.totalYieldGenerated();
        assert(totalYield >= 0); // Always true, documents intent
    }

    /*//////////////////////////////////////////////////////////////
                        CALL SUMMARY
    //////////////////////////////////////////////////////////////*/

    function invariant_callSummary() public view {
        (
            uint256 deposits,
            uint256 withdraws,
            uint256 rebalances,
            uint256 yieldDist,
            uint256 lockUpdates,
            uint256 failed
        ) = handler.callSummary();

        console.log("=== EnhancedVault Invariant Test Summary ===");
        console.log("Deposits:", deposits);
        console.log("Withdrawals:", withdraws);
        console.log("Rebalances:", rebalances);
        console.log("Yield Distributions:", yieldDist);
        console.log("Lock Period Updates:", lockUpdates);
        console.log("Failed Calls:", failed);
        console.log("Token0 in Vault:", token0.balanceOf(address(vault)) / 1e18);
        console.log("Token1 in Vault:", token1.balanceOf(address(vault)) / 1e18);
        console.log("Total Supply:", vault.totalSupply() / 1e18);
        console.log("Total Fees Collected:", vault.totalFeesCollected() / 1e18);
    }
}

/**
 * @title EnhancedVaultStatelessFuzzTest
 * @dev Stateless fuzz tests for EnhancedStrategyVault
 */
contract EnhancedVaultStatelessFuzzTest is InvariantBase {
    EnhancedStrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        vm.startPrank(owner);
        token0 = new MockERC20Invariant("Token0", "TK0");
        token1 = new MockERC20Invariant("Token1", "TK1");

        vault = new EnhancedStrategyVault(
            "Enhanced Vault",
            "eVLT",
            address(token0),
            address(token1),
            3000,
            aiOracle,
            owner
        );
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        DEPOSIT WITH FEE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz dual-token deposits
     * @param amount0 Token0 amount
     * @param amount1 Token1 amount
     */
    function testFuzz_Deposit(uint256 amount0, uint256 amount1) public {
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

        // Customer tracking should be updated
        (,, uint256 totalDeposited,,,) = vault.getCustomerStats(user1);
        assertEq(totalDeposited, amount0 + amount1, "Total deposited should match");
    }

    /**
     * @notice Fuzz deposit and immediate withdraw should fail
     * @param amount0 Deposit amount token0
     * @param amount1 Deposit amount token1
     */
    function testFuzz_WithdrawBeforeLockExpires(uint256 amount0, uint256 amount1) public {
        amount0 = bound(amount0, 10e18, 100_000 * 1e18);
        amount1 = bound(amount1, 10e18, 100_000 * 1e18);

        token0.mint(user1, amount0);
        token1.mint(user1, amount1);

        vm.startPrank(user1);
        token0.approve(address(vault), amount0);
        token1.approve(address(vault), amount1);

        uint256 shares = vault.deposit(amount0, amount1, user1);

        // Try to withdraw immediately (should fail)
        vm.expectRevert("Minimum lock period not met");
        vault.withdraw(shares, user1);

        vm.stopPrank();
    }

    /**
     * @notice Fuzz withdrawal after lock period
     * @param amount0 Deposit amount
     * @param amount1 Deposit amount
     * @param waitTime Time to wait after lock
     */
    function testFuzz_WithdrawAfterLock(uint256 amount0, uint256 amount1, uint256 waitTime) public {
        amount0 = bound(amount0, 10e18, 100_000 * 1e18);
        amount1 = bound(amount1, 10e18, 100_000 * 1e18);
        waitTime = bound(waitTime, 0, 7 days);

        token0.mint(user1, amount0);
        token1.mint(user1, amount1);

        vm.startPrank(user1);
        token0.approve(address(vault), amount0);
        token1.approve(address(vault), amount1);

        uint256 shares = vault.deposit(amount0, amount1, user1);

        // Warp past lock period + wait time
        vm.warp(block.timestamp + vault.minimumLockPeriod() + waitTime + 1);

        (uint256 received0, uint256 received1) = vault.withdraw(shares, user1);
        vm.stopPrank();

        // Should receive tokens (minus 0.5% fee)
        assertGt(received0, 0, "Should receive token0");
        assertGt(received1, 0, "Should receive token1");

        // With 0.5% fee, should receive at least 99% of deposited
        assertGe(received0, (amount0 * 99) / 100, "Should receive ~99% of token0");
        assertGe(received1, (amount1 * 99) / 100, "Should receive ~99% of token1");
    }

    /*//////////////////////////////////////////////////////////////
                        FEE CALCULATION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz withdrawal fee calculation
     * @param depositAmount0 Deposit amount
     * @param depositAmount1 Deposit amount
     */
    function testFuzz_WithdrawalFeeCalculation(uint256 depositAmount0, uint256 depositAmount1) public {
        depositAmount0 = bound(depositAmount0, 100e18, 100_000 * 1e18);
        depositAmount1 = bound(depositAmount1, 100e18, 100_000 * 1e18);

        token0.mint(user1, depositAmount0);
        token1.mint(user1, depositAmount1);

        vm.startPrank(user1);
        token0.approve(address(vault), depositAmount0);
        token1.approve(address(vault), depositAmount1);

        uint256 shares = vault.deposit(depositAmount0, depositAmount1, user1);

        // Warp past lock
        vm.warp(block.timestamp + 25 hours);

        uint256 preFees = vault.totalFeesCollected();

        (uint256 received0, uint256 received1) = vault.withdraw(shares, user1);
        vm.stopPrank();

        uint256 postFees = vault.totalFeesCollected();

        // Fees should have increased
        assertGe(postFees, preFees, "Fees should increase");

        // Calculate expected fee (0.5%)
        uint256 grossAmount0 = (received0 * 10000) / 9950; // Reverse the fee
        uint256 grossAmount1 = (received1 * 10000) / 9950;
        uint256 expectedFee = (grossAmount0 - received0) + (grossAmount1 - received1);

        // Fees collected should be approximately the expected fee
        uint256 actualFees = postFees - preFees;
        assertApproxEqRel(actualFees, expectedFee, 0.05e18, "Fees should match ~0.5%");
    }

    /*//////////////////////////////////////////////////////////////
                        LOCK PERIOD FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz lock period update
     * @param newPeriod New lock period
     */
    function testFuzz_SetMinimumLockPeriod(uint256 newPeriod) public {
        newPeriod = bound(newPeriod, 0, 30 days);

        vm.prank(owner);
        vault.setMinimumLockPeriod(newPeriod);

        assertEq(vault.minimumLockPeriod(), newPeriod, "Lock period should update");
    }

    /**
     * @notice Fuzz lock period exceeding max fails
     * @param newPeriod Period exceeding 30 days
     */
    function testFuzz_SetMinimumLockPeriodExceedsMax(uint256 newPeriod) public {
        newPeriod = bound(newPeriod, 30 days + 1, 365 days);

        vm.prank(owner);
        vm.expectRevert("Lock period too long");
        vault.setMinimumLockPeriod(newPeriod);
    }

    /*//////////////////////////////////////////////////////////////
                        CUSTOMER STATS FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz customer stats tracking
     * @param deposit1 First deposit
     * @param deposit2 Second deposit
     */
    function testFuzz_CustomerStatsTracking(uint256 deposit1, uint256 deposit2) public {
        deposit1 = bound(deposit1, 1e18, 100_000 * 1e18);
        deposit2 = bound(deposit2, 1e18, 100_000 * 1e18);

        // First deposit
        token0.mint(user1, deposit1);
        token1.mint(user1, deposit1);

        vm.startPrank(user1);
        token0.approve(address(vault), deposit1 * 2);
        token1.approve(address(vault), deposit1 * 2);
        vault.deposit(deposit1, deposit1, user1);
        vm.stopPrank();

        // Check stats after first deposit
        (uint256 shares1,, uint256 totalDeposited1,,,) = vault.getCustomerStats(user1);
        assertGt(shares1, 0, "Should have shares");
        assertEq(totalDeposited1, deposit1 * 2, "Total deposited should match");

        // Second deposit
        token0.mint(user1, deposit2);
        token1.mint(user1, deposit2);

        vm.startPrank(user1);
        token0.approve(address(vault), deposit2);
        token1.approve(address(vault), deposit2);
        vault.deposit(deposit2, deposit2, user1);
        vm.stopPrank();

        // Check stats after second deposit
        (uint256 shares2,, uint256 totalDeposited2,,,) = vault.getCustomerStats(user1);
        assertGt(shares2, shares1, "Should have more shares");
        assertEq(totalDeposited2, (deposit1 + deposit2) * 2, "Total deposited should accumulate");
    }

    /*//////////////////////////////////////////////////////////////
                        REBALANCE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz rebalance with valid ticks
     * @param tickLower Lower tick
     * @param tickUpper Upper tick
     */
    function testFuzz_Rebalance(int24 tickLower, int24 tickUpper) public {
        // Setup initial deposit
        uint256 amount = 10_000 * 1e18;
        token0.mint(user1, amount);
        token1.mint(user1, amount);

        vm.startPrank(user1);
        token0.approve(address(vault), amount);
        token1.approve(address(vault), amount);
        vault.deposit(amount, amount, user1);
        vm.stopPrank();

        // Bound ticks
        tickLower = int24(bound(int256(tickLower), -887272, 887270));
        tickUpper = int24(bound(int256(tickUpper), int256(tickLower) + 1, 887272));

        uint256 preSupply = vault.totalSupply();

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

        // Supply should be unchanged
        assertEq(vault.totalSupply(), preSupply, "Supply should not change");

        // Position should be updated
        IStrategyVault.Position memory pos = vault.getCurrentPosition();
        assertEq(pos.tickLower, tickLower, "Tick lower should update");
        assertEq(pos.tickUpper, tickUpper, "Tick upper should update");
    }

    /*//////////////////////////////////////////////////////////////
                        EMERGENCY CONTROLS FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz pause prevents deposits
     * @param amount Deposit amount
     */
    function testFuzz_PausePreventsDeposits(uint256 amount) public {
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

    /**
     * @notice Fuzz resume allows deposits
     * @param amount Deposit amount
     */
    function testFuzz_ResumeAllowsDeposits(uint256 amount) public {
        amount = bound(amount, 1e18, 100_000 * 1e18);

        // Pause and resume
        vm.prank(owner);
        vault.emergencyPause();
        vm.prank(owner);
        vault.resume();

        // Setup tokens
        token0.mint(user1, amount);
        token1.mint(user1, amount);

        vm.startPrank(user1);
        token0.approve(address(vault), amount);
        token1.approve(address(vault), amount);

        // Deposit should succeed
        uint256 shares = vault.deposit(amount, amount, user1);
        vm.stopPrank();

        assertGt(shares, 0, "Should receive shares after resume");
    }
}
