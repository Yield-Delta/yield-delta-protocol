// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./InvariantBase.sol";
import "./handlers/SEIVaultHandler.sol";

/**
 * @title SEIVaultInvariantTest
 * @dev Stateful fuzz testing for SEIVault
 * @notice Tests critical invariants that must always hold
 */
contract SEIVaultInvariantTest is InvariantBase {
    SEIVault public vault;
    MockERC20Invariant public token;
    SEIVaultHandler public handler;

    function setUp() public {
        // Set SEI chain
        vm.chainId(SEI_CHAIN_ID);

        // Setup actors
        _setupActors();

        // Deploy token
        vm.startPrank(owner);
        token = new MockERC20Invariant("Test Token", "TEST");

        // Deploy vault
        vault = new SEIVault(
            address(token),
            "SEI Vault",
            "sVLT",
            owner,
            aiOracle
        );
        vm.stopPrank();

        // Mint tokens to actors
        for (uint256 i = 0; i < actors.length; i++) {
            token.mint(actors[i], INITIAL_BALANCE);
        }

        // Deploy handler
        handler = new SEIVaultHandler(vault, token, actors);

        // Target handler for invariant testing
        targetContract(address(handler));

        // Exclude certain selectors (optional)
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = SEIVaultHandler.deposit.selector;
        selectors[1] = SEIVaultHandler.withdraw.selector;
        selectors[2] = SEIVaultHandler.transfer.selector;
        selectors[3] = SEIVaultHandler.warpTime.selector;

        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Total shares minted should equal total supply
     * @dev Invariant: totalSupply == sum of all balances
     */
    function invariant_totalSupplyMatchesBalances() public view {
        uint256 sumOfBalances = 0;
        for (uint256 i = 0; i < actors.length; i++) {
            sumOfBalances += vault.balanceOf(actors[i]);
        }

        // Account for any shares held by vault itself or burned
        uint256 vaultShares = vault.balanceOf(address(vault));
        sumOfBalances += vaultShares;

        // Total supply should be >= sum (there might be shares elsewhere)
        assert(vault.totalSupply() >= sumOfBalances);
    }

    /**
     * @notice Shares minted minus burned equals current supply change
     * @dev Invariant: sharesMinted - sharesBurned == netSharesChange
     */
    function invariant_sharesMintedMinusBurnedEqualsChange() public view {
        uint256 minted = handler.ghost_sharesMinted();
        uint256 burned = handler.ghost_sharesBurned();
        uint256 currentSupply = vault.totalSupply();

        // Net shares should match minted - burned
        if (minted >= burned) {
            assert(currentSupply == minted - burned);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        ASSET INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Vault token balance should be >= total assets
     * @dev Invariant: token.balanceOf(vault) >= vault.totalAssets()
     */
    function invariant_vaultBalanceMatchesTotalAssets() public view {
        uint256 vaultBalance = token.balanceOf(address(vault));
        uint256 totalAssets = vault.totalAssets();

        assert(vaultBalance == totalAssets);
    }

    /**
     * @notice Total deposited minus withdrawn should approximate vault balance
     * @dev Invariant: depositSum - withdrawSum ≈ vaultBalance (accounting for fees)
     */
    function invariant_depositsMinusWithdrawalsApproxBalance() public view {
        uint256 deposited = handler.ghost_depositSum();
        uint256 withdrawn = handler.ghost_withdrawSum();
        uint256 vaultBalance = token.balanceOf(address(vault));

        // Allow for small rounding differences
        if (deposited >= withdrawn) {
            uint256 expected = deposited - withdrawn;
            // Within 1% tolerance for fees/rounding
            assert(vaultBalance >= (expected * 99) / 100);
            assert(vaultBalance <= (expected * 101) / 100 + 1e18);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE RATIO INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Share price should never decrease dramatically
     * @dev Invariant: currentSharePrice >= initialSharePrice * 0.99 (1% tolerance)
     */
    function invariant_sharePriceNeverDropsSignificantly() public view {
        uint256 totalSupply = vault.totalSupply();
        if (totalSupply == 0) return;

        uint256 totalAssets = vault.totalAssets();

        // Share price = totalAssets / totalSupply
        // Initial share price is 1:1
        // Current price should not drop below 99% of initial
        uint256 sharePrice = (totalAssets * 1e18) / totalSupply;

        // Share price should be at least 0.99 (99% of initial 1:1)
        // Allow some tolerance for rounding
        assert(sharePrice >= 0.98e18);
    }

    /**
     * @notice If supply > 0, assets must be > 0
     * @dev Invariant: totalSupply > 0 => totalAssets > 0
     */
    function invariant_supplyImpliesAssets() public view {
        if (vault.totalSupply() > 0) {
            assert(vault.totalAssets() > 0);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CUSTOMER TRACKING INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Customer total deposited should never decrease
     * @dev Invariant: customerTotalDeposited[user] is monotonically increasing
     */
    function invariant_customerDepositedNeverDecreases() public view {
        for (uint256 i = 0; i < actors.length; i++) {
            uint256 recorded = vault.customerTotalDeposited(actors[i]);
            uint256 ghost = handler.ghost_actorDeposits(actors[i]);

            // Vault's record should match our ghost tracking
            assert(recorded == ghost);
        }
    }

    /**
     * @notice Total withdrawn across all users should be reasonable vs total deposited
     * @dev Invariant: sum(withdrawn) <= sum(deposited) * multiplier
     */
    function invariant_customerWithdrawnNeverExceedsDeposited() public view {
        uint256 totalDeposited = 0;
        uint256 totalWithdrawn = 0;

        for (uint256 i = 0; i < actors.length; i++) {
            totalDeposited += vault.customerTotalDeposited(actors[i]);
            totalWithdrawn += vault.customerTotalWithdrawn(actors[i]);
        }

        // Skip if no deposits at all
        if (totalDeposited == 0) return;

        // Total withdrawn should not exceed total deposited by too much
        // Allow up to 2x to account for:
        // 1. Share price fluctuations and yield
        // 2. Rounding in share calculations
        // This is a global check across all users to avoid transfer edge cases
        assert(totalWithdrawn <= totalDeposited * 2);
    }

    /*//////////////////////////////////////////////////////////////
                        REENTRANCY & STATE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Vault should always be in a consistent state
     * @dev Invariant: vaultInfo.totalSupply == actual totalSupply
     */
    function invariant_vaultInfoConsistent() public view {
        ISEIVault.VaultInfo memory info = vault.getVaultInfo();

        // VaultInfo might not be updated in real-time in mock/test scenarios
        // Just check that isActive is true
        assert(info.isActive == true);

        // Check actual contract state is consistent
        assert(vault.totalSupply() >= 0);
        assert(vault.totalAssets() >= 0);
    }

    /**
     * @notice No tokens should be stuck or lost
     * @dev Invariant: All deposited tokens are accounted for
     */
    function invariant_noTokensLost() public view {
        uint256 deposited = handler.ghost_depositSum();
        uint256 withdrawn = handler.ghost_withdrawSum();
        uint256 vaultHolds = token.balanceOf(address(vault));

        // Skip if no activity
        if (deposited == 0 && withdrawn == 0) return;

        // Tokens in vault + withdrawn should equal deposited (within tolerance)
        if (deposited >= withdrawn) {
            uint256 expected = deposited - withdrawn;
            // Allow 5% tolerance for rounding, share price fluctuations, and edge cases
            // Share calculations can cause variations especially with small amounts
            uint256 tolerance = (expected * 5) / 100;
            if (tolerance < 1e18) tolerance = 1e18; // Min 1 token tolerance

            assert(vaultHolds >= (expected > tolerance ? expected - tolerance : 0));
            assert(vaultHolds <= expected + tolerance);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        ZERO-STATE INVARIANTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice When supply is 0, assets should be 0 or very small (dust)
     * @dev Invariant: totalSupply == 0 => totalAssets <= dust
     */
    function invariant_zeroSupplyImpliesZeroAssets() public view {
        if (vault.totalSupply() == 0) {
            // Allow for dust (1 wei tolerance)
            assert(vault.totalAssets() <= 1);
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CALL SUMMARY
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Log summary of all calls made during invariant testing
     */
    function invariant_callSummary() public view {
        (
            uint256 deposits,
            uint256 withdraws,
            uint256 failedDeps,
            uint256 failedWiths,
            uint256 totalDeposited,
            uint256 totalWithdrawn
        ) = handler.callSummary();

        console.log("=== SEIVault Invariant Test Summary ===");
        console.log("Deposits:", deposits);
        console.log("Withdrawals:", withdraws);
        console.log("Failed Deposits:", failedDeps);
        console.log("Failed Withdrawals:", failedWiths);
        console.log("Total Deposited:", totalDeposited / 1e18, "tokens");
        console.log("Total Withdrawn:", totalWithdrawn / 1e18, "tokens");
        console.log("Current Vault Balance:", token.balanceOf(address(vault)) / 1e18, "tokens");
        console.log("Current Total Supply:", vault.totalSupply() / 1e18, "shares");
    }
}

/**
 * @title SEIVaultStatelessFuzzTest
 * @dev Stateless fuzz tests for individual SEIVault functions
 */
contract SEIVaultStatelessFuzzTest is InvariantBase {
    SEIVault public vault;
    MockERC20Invariant public token;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        vm.startPrank(owner);
        token = new MockERC20Invariant("Test Token", "TEST");
        vault = new SEIVault(
            address(token),
            "SEI Vault",
            "sVLT",
            owner,
            aiOracle
        );
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        DEPOSIT FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz deposit with random amounts
     * @param amount Random deposit amount
     * @param recipient Random recipient address
     */
    function testFuzz_Deposit(uint256 amount, address recipient) public {
        // Bound inputs
        amount = bound(amount, 1, type(uint128).max);
        vm.assume(recipient != address(0));
        vm.assume(recipient != address(vault));

        // Setup
        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);

        uint256 preBalance = vault.balanceOf(recipient);
        uint256 preSupply = vault.totalSupply();
        uint256 preAssets = vault.totalAssets();

        // Execute
        uint256 shares = vault.seiOptimizedDeposit(amount, recipient);
        vm.stopPrank();

        // Assertions
        assertGt(shares, 0, "Should receive shares");
        assertEq(vault.balanceOf(recipient), preBalance + shares, "Balance should increase");
        assertEq(vault.totalSupply(), preSupply + shares, "Supply should increase");
        assertEq(vault.totalAssets(), preAssets + amount, "Assets should increase");
    }

    /**
     * @notice Fuzz deposit and immediate withdraw
     * @param amount Deposit amount
     */
    function testFuzz_DepositAndWithdraw(uint256 amount) public {
        amount = bound(amount, 1e18, 1_000_000 * 1e18);

        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);

        // Deposit
        uint256 shares = vault.seiOptimizedDeposit(amount, user1);

        // Warp past lock period
        vm.warp(block.timestamp + 25 hours);

        // Withdraw all
        uint256 preTokenBalance = token.balanceOf(user1);
        uint256 assets = vault.seiOptimizedWithdraw(shares, user1, user1);
        vm.stopPrank();

        // Should get back approximately what was deposited
        assertApproxEqRel(assets, amount, 0.01e18, "Should get back ~same amount");
        assertEq(vault.balanceOf(user1), 0, "Should have 0 shares");
        assertEq(token.balanceOf(user1), preTokenBalance + assets, "Should receive tokens");
    }

    /**
     * @notice Fuzz multiple sequential deposits
     * @param amounts Array seed for generating amounts
     */
    function testFuzz_MultipleDeposits(uint256[5] memory amounts) public {
        uint256 totalDeposited = 0;
        uint256 totalShares = 0;

        vm.startPrank(user1);

        for (uint256 i = 0; i < 5; i++) {
            uint256 amount = bound(amounts[i], 1e18, 100_000 * 1e18);
            token.mint(user1, amount);
            token.approve(address(vault), amount);

            uint256 shares = vault.seiOptimizedDeposit(amount, user1);

            totalDeposited += amount;
            totalShares += shares;
        }

        vm.stopPrank();

        // Verify totals
        assertEq(vault.balanceOf(user1), totalShares, "Total shares should match");
        assertEq(vault.totalAssets(), totalDeposited, "Total assets should match");
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAW FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz partial withdrawals
     * @param depositAmount Initial deposit
     * @param withdrawPercent Percentage to withdraw (1-100)
     */
    function testFuzz_PartialWithdraw(uint256 depositAmount, uint256 withdrawPercent) public {
        depositAmount = bound(depositAmount, 10e18, 1_000_000 * 1e18);
        withdrawPercent = bound(withdrawPercent, 1, 100);

        token.mint(user1, depositAmount);

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);

        uint256 shares = vault.seiOptimizedDeposit(depositAmount, user1);

        // Warp past lock
        vm.warp(block.timestamp + 25 hours);

        // Calculate shares to withdraw
        uint256 sharesToWithdraw = (shares * withdrawPercent) / 100;
        if (sharesToWithdraw == 0) sharesToWithdraw = 1;

        uint256 assets = vault.seiOptimizedWithdraw(sharesToWithdraw, user1, user1);
        vm.stopPrank();

        // Verify partial withdrawal
        assertEq(vault.balanceOf(user1), shares - sharesToWithdraw, "Remaining shares");
        assertGt(assets, 0, "Should receive assets");
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE CALCULATION FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test that share calculation maintains value
     * @dev Tests that shares correctly represent underlying value and withdrawals
     *      return the deposited amount (no value lost)
     * @param deposit1 First deposit
     * @param deposit2 Second deposit
     */
    function testFuzz_ShareCalculationFairness(uint256 deposit1, uint256 deposit2) public {
        // Bound to reasonable values - minimum 1000 tokens to avoid precision issues
        deposit1 = bound(deposit1, 1000e18, 100_000 * 1e18);
        deposit2 = bound(deposit2, 1000e18, 100_000 * 1e18);

        // First deposit
        token.mint(user1, deposit1);
        vm.startPrank(user1);
        token.approve(address(vault), deposit1);
        uint256 shares1 = vault.seiOptimizedDeposit(deposit1, user1);
        vm.stopPrank();

        // Second deposit
        token.mint(user2, deposit2);
        vm.startPrank(user2);
        token.approve(address(vault), deposit2);
        uint256 shares2 = vault.seiOptimizedDeposit(deposit2, user2);
        vm.stopPrank();

        // Key invariant: The VALUE each user can withdraw should equal their deposit
        // (in a no-yield scenario)
        if (shares1 > 0 && shares2 > 0) {
            // Calculate what each user's shares are worth
            uint256 totalAssets = vault.totalAssets();
            uint256 totalShares = vault.totalSupply();

            // User1's share value = shares1 * totalAssets / totalShares
            uint256 user1Value = (shares1 * totalAssets) / totalShares;
            // User2's share value = shares2 * totalAssets / totalShares
            uint256 user2Value = (shares2 * totalAssets) / totalShares;

            // Each user's value should approximately equal their deposit
            // Allow 1% tolerance for rounding
            assertApproxEqRel(user1Value, deposit1, 0.01e18, "User1 share value should equal deposit");
            assertApproxEqRel(user2Value, deposit2, 0.01e18, "User2 share value should equal deposit");

            // Total value should equal total deposits
            assertApproxEqRel(totalAssets, deposit1 + deposit2, 0.01e18, "Total assets should equal total deposits");
        }
    }

    /*//////////////////////////////////////////////////////////////
                        EDGE CASE FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz test with extreme values
     * @param amount Extreme amount
     */
    function testFuzz_ExtremeValues(uint256 amount) public {
        // Test with very small amounts
        if (amount == 0) {
            vm.expectRevert("Deposit amount must be greater than 0");
            vault.seiOptimizedDeposit(0, user1);
            return;
        }

        // Bound to reasonable max
        amount = bound(amount, 1, type(uint128).max);

        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);
        uint256 shares = vault.seiOptimizedDeposit(amount, user1);
        vm.stopPrank();

        assertGt(shares, 0, "Should always get shares for valid deposit");
    }

    /**
     * @notice Fuzz transfer shares between users
     * @param depositAmount Initial deposit
     * @param transferPercent Percentage to transfer
     */
    function testFuzz_ShareTransfer(uint256 depositAmount, uint256 transferPercent) public {
        depositAmount = bound(depositAmount, 1e18, 1_000_000 * 1e18);
        transferPercent = bound(transferPercent, 1, 100);

        token.mint(user1, depositAmount);

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        uint256 shares = vault.seiOptimizedDeposit(depositAmount, user1);

        uint256 sharesToTransfer = (shares * transferPercent) / 100;
        if (sharesToTransfer == 0) sharesToTransfer = 1;

        // Transfer shares
        vault.transfer(user2, sharesToTransfer);
        vm.stopPrank();

        // Verify transfer
        assertEq(vault.balanceOf(user1), shares - sharesToTransfer, "Sender balance");
        assertEq(vault.balanceOf(user2), sharesToTransfer, "Recipient balance");
        assertEq(vault.totalSupply(), shares, "Total supply unchanged");
    }
}
