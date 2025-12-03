// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../src/SEIVault.sol";
import "../../src/StrategyVault.sol";
import "../../src/AIOracle.sol";
import "../../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "../../lib/openzeppelin-contracts/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MockToken
 * @dev Simple mock ERC20 for testing
 */
contract MockToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * @title SEIVaultFuzzTest
 * @dev Comprehensive stateless fuzz tests for SEIVault
 */
contract SEIVaultFuzzTest is Test {
    SEIVault public vault;
    MockToken public token;

    address public owner = address(0x1);
    address public aiOracle = address(0x2);
    address public user1 = address(0x10);
    address public user2 = address(0x11);

    uint256 constant SEI_CHAIN_ID = 1328;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);

        vm.startPrank(owner);
        token = new MockToken("Test Token", "TEST");
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
                        DEPOSIT EDGE CASES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz deposit with boundary values
     */
    function testFuzz_DepositBoundaryValues(uint256 amount) public {
        // Skip 0
        vm.assume(amount > 0);

        // Cap at reasonable max to avoid overflow
        amount = bound(amount, 1, type(uint128).max);

        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);

        uint256 shares = vault.seiOptimizedDeposit(amount, user1);
        vm.stopPrank();

        // First deposit: shares == amount
        assertEq(shares, amount, "First deposit should give 1:1 shares");
        assertEq(vault.balanceOf(user1), amount, "User balance should match");
    }

    /**
     * @notice Fuzz deposit with multiple users and varying ratios
     */
    function testFuzz_MultiUserDeposits(
        uint256 amount1,
        uint256 amount2,
        uint256 amount3
    ) public {
        // Bound amounts
        amount1 = bound(amount1, 1e18, 1_000_000 * 1e18);
        amount2 = bound(amount2, 1e18, 1_000_000 * 1e18);
        amount3 = bound(amount3, 1e18, 1_000_000 * 1e18);

        address user3 = address(0x12);

        // User 1 deposits
        token.mint(user1, amount1);
        vm.startPrank(user1);
        token.approve(address(vault), amount1);
        uint256 shares1 = vault.seiOptimizedDeposit(amount1, user1);
        vm.stopPrank();

        // User 2 deposits
        token.mint(user2, amount2);
        vm.startPrank(user2);
        token.approve(address(vault), amount2);
        uint256 shares2 = vault.seiOptimizedDeposit(amount2, user2);
        vm.stopPrank();

        // User 3 deposits
        token.mint(user3, amount3);
        vm.startPrank(user3);
        token.approve(address(vault), amount3);
        uint256 shares3 = vault.seiOptimizedDeposit(amount3, user3);
        vm.stopPrank();

        // Verify total supply
        uint256 totalShares = shares1 + shares2 + shares3;
        assertEq(vault.totalSupply(), totalShares, "Total supply should match");

        // Verify total assets
        uint256 totalAssets = amount1 + amount2 + amount3;
        assertEq(vault.totalAssets(), totalAssets, "Total assets should match");
    }

    /**
     * @notice Fuzz deposit to different recipient
     */
    function testFuzz_DepositToRecipient(uint256 amount, address recipient) public {
        amount = bound(amount, 1e18, 1_000_000 * 1e18);
        vm.assume(recipient != address(0));
        vm.assume(recipient != address(vault));

        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);
        uint256 shares = vault.seiOptimizedDeposit(amount, recipient);
        vm.stopPrank();

        // Shares should go to recipient
        assertEq(vault.balanceOf(recipient), shares, "Recipient should receive shares");
        assertEq(vault.balanceOf(user1), 0, "Sender should have no shares");
    }

    /*//////////////////////////////////////////////////////////////
                        WITHDRAWAL EDGE CASES
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz full withdrawal
     */
    function testFuzz_FullWithdrawal(uint256 depositAmount) public {
        depositAmount = bound(depositAmount, 1e18, 1_000_000 * 1e18);

        token.mint(user1, depositAmount);

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        uint256 shares = vault.seiOptimizedDeposit(depositAmount, user1);

        // Warp past lock period
        vm.warp(block.timestamp + 25 hours);

        // Full withdrawal
        uint256 preBalance = token.balanceOf(user1);
        uint256 assets = vault.seiOptimizedWithdraw(shares, user1, user1);
        vm.stopPrank();

        assertEq(assets, depositAmount, "Should receive all deposited");
        assertEq(vault.balanceOf(user1), 0, "Should have 0 shares");
        assertEq(token.balanceOf(user1), preBalance + assets, "Token balance should increase");
    }

    /**
     * @notice Fuzz sequential partial withdrawals
     */
    function testFuzz_SequentialWithdrawals(
        uint256 depositAmount,
        uint256[5] memory withdrawPercents
    ) public {
        depositAmount = bound(depositAmount, 100e18, 1_000_000 * 1e18);

        token.mint(user1, depositAmount);

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        uint256 totalShares = vault.seiOptimizedDeposit(depositAmount, user1);

        // Warp past lock period
        vm.warp(block.timestamp + 25 hours);

        uint256 remainingShares = totalShares;
        uint256 totalWithdrawn = 0;

        for (uint256 i = 0; i < 5; i++) {
            if (remainingShares == 0) break;

            uint256 percent = bound(withdrawPercents[i], 1, 100);
            uint256 sharesToWithdraw = (remainingShares * percent) / 100;
            if (sharesToWithdraw == 0) sharesToWithdraw = 1;
            if (sharesToWithdraw > remainingShares) sharesToWithdraw = remainingShares;

            uint256 assets = vault.seiOptimizedWithdraw(sharesToWithdraw, user1, user1);
            remainingShares -= sharesToWithdraw;
            totalWithdrawn += assets;
        }

        vm.stopPrank();

        // Total withdrawn should be <= deposited
        assertLe(totalWithdrawn, depositAmount, "Cannot withdraw more than deposited");
        assertEq(vault.balanceOf(user1), remainingShares, "Remaining shares should match");
    }

    /**
     * @notice Fuzz withdrawal to different recipient
     */
    function testFuzz_WithdrawToRecipient(uint256 amount, address recipient) public {
        amount = bound(amount, 1e18, 1_000_000 * 1e18);
        vm.assume(recipient != address(0));
        vm.assume(recipient != address(vault));
        vm.assume(recipient != user1);

        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);
        uint256 shares = vault.seiOptimizedDeposit(amount, user1);

        vm.warp(block.timestamp + 25 hours);

        uint256 preRecipientBalance = token.balanceOf(recipient);
        uint256 assets = vault.seiOptimizedWithdraw(shares, user1, recipient);
        vm.stopPrank();

        // Tokens should go to recipient
        assertEq(token.balanceOf(recipient), preRecipientBalance + assets, "Recipient should receive tokens");
    }

    /*//////////////////////////////////////////////////////////////
                        LOCK PERIOD TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz lock period enforcement
     */
    function testFuzz_LockPeriodEnforcement(uint256 amount, uint256 waitTime) public {
        amount = bound(amount, 1e18, 1_000_000 * 1e18);
        waitTime = bound(waitTime, 0, 48 hours);

        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);
        uint256 shares = vault.seiOptimizedDeposit(amount, user1);

        // Advance time
        vm.warp(block.timestamp + waitTime);

        if (waitTime < 24 hours) {
            // Should revert
            vm.expectRevert("Assets are locked for 24 hours after deposit");
            vault.seiOptimizedWithdraw(shares, user1, user1);
        } else {
            // Should succeed
            uint256 assets = vault.seiOptimizedWithdraw(shares, user1, user1);
            assertGt(assets, 0, "Should withdraw assets");
        }

        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        SHARE TRANSFER TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz share transfers
     */
    function testFuzz_ShareTransfer(
        uint256 depositAmount,
        uint256 transferAmount
    ) public {
        depositAmount = bound(depositAmount, 1e18, 1_000_000 * 1e18);

        token.mint(user1, depositAmount);

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        uint256 shares = vault.seiOptimizedDeposit(depositAmount, user1);

        transferAmount = bound(transferAmount, 1, shares);

        uint256 preUser1Balance = vault.balanceOf(user1);
        uint256 preUser2Balance = vault.balanceOf(user2);

        vault.transfer(user2, transferAmount);
        vm.stopPrank();

        assertEq(vault.balanceOf(user1), preUser1Balance - transferAmount, "Sender balance should decrease");
        assertEq(vault.balanceOf(user2), preUser2Balance + transferAmount, "Recipient balance should increase");

        // Total supply unchanged
        assertEq(vault.totalSupply(), shares, "Total supply should not change");
    }

    /**
     * @notice Fuzz approve and transferFrom
     */
    function testFuzz_ApproveTransferFrom(
        uint256 depositAmount,
        uint256 approveAmount,
        uint256 transferAmount
    ) public {
        depositAmount = bound(depositAmount, 1e18, 1_000_000 * 1e18);

        token.mint(user1, depositAmount);

        vm.startPrank(user1);
        token.approve(address(vault), depositAmount);
        uint256 shares = vault.seiOptimizedDeposit(depositAmount, user1);

        approveAmount = bound(approveAmount, 0, shares);
        vault.approve(user2, approveAmount);
        vm.stopPrank();

        transferAmount = bound(transferAmount, 0, approveAmount);

        if (transferAmount > 0) {
            vm.prank(user2);
            vault.transferFrom(user1, user2, transferAmount);

            assertEq(vault.balanceOf(user2), transferAmount, "Recipient should receive shares");
        }
    }

    /*//////////////////////////////////////////////////////////////
                        CUSTOMER STATS TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz customer statistics tracking
     */
    function testFuzz_CustomerStats(
        uint256 depositAmount1,
        uint256 depositAmount2,
        uint256 withdrawPercent
    ) public {
        depositAmount1 = bound(depositAmount1, 1e18, 500_000 * 1e18);
        depositAmount2 = bound(depositAmount2, 1e18, 500_000 * 1e18);
        withdrawPercent = bound(withdrawPercent, 1, 100);

        uint256 totalDeposit = depositAmount1 + depositAmount2;

        token.mint(user1, totalDeposit);

        vm.startPrank(user1);
        token.approve(address(vault), totalDeposit);

        // First deposit
        vault.seiOptimizedDeposit(depositAmount1, user1);

        // Second deposit
        uint256 totalShares = vault.seiOptimizedDeposit(depositAmount2, user1);
        totalShares = vault.balanceOf(user1);

        // Check stats
        (
            ,
            ,
            uint256 totalDeposited,
            uint256 totalWithdrawn,
            uint256 depositTime,
            uint256 lockTimeRemaining
        ) = vault.getCustomerStats(user1);

        assertEq(totalDeposited, totalDeposit, "Total deposited should match");
        assertEq(totalWithdrawn, 0, "Nothing withdrawn yet");
        assertGt(depositTime, 0, "Deposit time should be set");
        assertGt(lockTimeRemaining, 0, "Should have lock time remaining");

        // Warp and withdraw
        vm.warp(block.timestamp + 25 hours);

        uint256 sharesToWithdraw = (totalShares * withdrawPercent) / 100;
        if (sharesToWithdraw == 0) sharesToWithdraw = 1;

        vault.seiOptimizedWithdraw(sharesToWithdraw, user1, user1);
        vm.stopPrank();

        // Check stats again
        (,, totalDeposited, totalWithdrawn,,) = vault.getCustomerStats(user1);

        assertEq(totalDeposited, totalDeposit, "Total deposited unchanged");
        assertGt(totalWithdrawn, 0, "Should have withdrawn");
    }

    /*//////////////////////////////////////////////////////////////
                        REBALANCE TESTS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Fuzz AI rebalance
     */
    function testFuzz_AIRebalance(int24 tickLower, int24 tickUpper) public {
        // First deposit some assets
        uint256 amount = 10_000 * 1e18;
        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);
        vault.seiOptimizedDeposit(amount, user1);
        vm.stopPrank();

        // Warp time to allow rebalance (400 seconds + buffer)
        vm.warp(block.timestamp + 401);

        // Bound ticks
        tickLower = int24(bound(int256(tickLower), -887272, 887270));
        tickUpper = int24(bound(int256(tickUpper), int256(tickLower) + 1, 887272));

        uint256 preSupply = vault.totalSupply();
        uint256 preAssets = vault.totalAssets();

        // Execute rebalance
        ISEIVault.AIRebalanceParams memory params = ISEIVault.AIRebalanceParams({
            newTickLower: tickLower,
            newTickUpper: tickUpper,
            minAmount0: 0,
            minAmount1: 0,
            deadline: block.timestamp + 1 hours,
            aiSignature: ""
        });

        vm.prank(aiOracle);
        vault.rebalance(params);

        // Verify state unchanged (rebalance doesn't affect shares/assets)
        assertEq(vault.totalSupply(), preSupply, "Supply unchanged");
        assertEq(vault.totalAssets(), preAssets, "Assets unchanged");

        // Verify position updated
        ISEIVault.Position memory pos = vault.getCurrentPosition();
        assertEq(pos.tickLower, tickLower, "Tick lower updated");
        assertEq(pos.tickUpper, tickUpper, "Tick upper updated");
    }

    /**
     * @notice Fuzz rebalance interval
     */
    function testFuzz_RebalanceInterval(uint256 timeBetween) public {
        // Setup
        uint256 amount = 10_000 * 1e18;
        token.mint(user1, amount);

        vm.startPrank(user1);
        token.approve(address(vault), amount);
        vault.seiOptimizedDeposit(amount, user1);
        vm.stopPrank();

        // Warp time to allow first rebalance (400 seconds + buffer)
        vm.warp(block.timestamp + 401);

        // First rebalance
        ISEIVault.AIRebalanceParams memory params = ISEIVault.AIRebalanceParams({
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
        // SEI MIN_REBALANCE_INTERVAL is 400 (in block.timestamp units, which is seconds)
        timeBetween = bound(timeBetween, 0, 1000); // Test 0-1000 seconds
        vm.warp(block.timestamp + timeBetween);

        params.newTickLower = -200;
        params.newTickUpper = 200;
        params.deadline = block.timestamp + 1 hours;

        if (timeBetween < 400) { // MIN_REBALANCE_INTERVAL for SEIVault is 400 seconds
            vm.expectRevert("Rebalance too frequent");
            vm.prank(aiOracle);
            vault.rebalance(params);
        } else {
            vm.prank(aiOracle);
            vault.rebalance(params);
        }
    }
}

/**
 * @title CrossContractFuzzTest
 * @dev Tests interactions between multiple contracts
 */
contract CrossContractFuzzTest is Test {
    using ECDSA for bytes32;

    SEIVault public seiVault;
    StrategyVault public strategyVault;
    AIOracle public oracle;
    MockToken public token0;
    MockToken public token1;

    address public owner = address(0x1);
    address public user1 = address(0x10);

    uint256 internal signerKey = 0xA11CE;
    address internal signer;

    uint256 constant SEI_CHAIN_ID = 1328;

    function setUp() public {
        vm.chainId(SEI_CHAIN_ID);
        signer = vm.addr(signerKey);

        vm.startPrank(owner);

        token0 = new MockToken("Token0", "TK0");
        token1 = new MockToken("Token1", "TK1");

        oracle = new AIOracle(owner);
        oracle.registerAIModel("test_model", signer);

        seiVault = new SEIVault(
            address(token0),
            "SEI Vault",
            "sVLT",
            owner,
            address(oracle)
        );

        strategyVault = new StrategyVault(
            "Strategy Vault",
            "sSTRAT",
            address(token0),
            address(token1),
            3000,
            address(oracle),
            owner
        );

        vm.stopPrank();
    }

    /**
     * @notice Fuzz cross-vault operations
     */
    function testFuzz_CrossVaultOperations(
        uint256 seiAmount,
        uint256 strategyAmount0,
        uint256 strategyAmount1
    ) public {
        seiAmount = bound(seiAmount, 1e18, 500_000 * 1e18);
        strategyAmount0 = bound(strategyAmount0, 1e18, 500_000 * 1e18);
        strategyAmount1 = bound(strategyAmount1, 1e18, 500_000 * 1e18);

        // Mint tokens
        token0.mint(user1, seiAmount + strategyAmount0);
        token1.mint(user1, strategyAmount1);

        vm.startPrank(user1);

        // Deposit to SEI vault
        token0.approve(address(seiVault), seiAmount);
        uint256 seiShares = seiVault.seiOptimizedDeposit(seiAmount, user1);

        // Deposit to Strategy vault
        token0.approve(address(strategyVault), strategyAmount0);
        token1.approve(address(strategyVault), strategyAmount1);
        uint256 strategyShares = strategyVault.deposit(strategyAmount0, strategyAmount1, user1);

        vm.stopPrank();

        // Verify isolated states
        assertEq(seiVault.balanceOf(user1), seiShares, "SEI vault shares");
        assertEq(strategyVault.balanceOf(user1), strategyShares, "Strategy vault shares");

        // Verify token distributions
        assertEq(token0.balanceOf(address(seiVault)), seiAmount, "SEI vault token0");
        assertEq(token0.balanceOf(address(strategyVault)), strategyAmount0, "Strategy vault token0");
        assertEq(token1.balanceOf(address(strategyVault)), strategyAmount1, "Strategy vault token1");
    }

    /**
     * @notice Fuzz oracle integration with multiple vaults
     */
    function testFuzz_OracleMultiVault(
        int24 seiTickLower,
        int24 seiTickUpper,
        int24 strategyTickLower,
        int24 strategyTickUpper
    ) public {
        // Bound ticks
        seiTickLower = int24(bound(int256(seiTickLower), -887272, 887270));
        seiTickUpper = int24(bound(int256(seiTickUpper), int256(seiTickLower) + 1, 887272));
        strategyTickLower = int24(bound(int256(strategyTickLower), -887272, 887270));
        strategyTickUpper = int24(bound(int256(strategyTickUpper), int256(strategyTickLower) + 1, 887272));

        // Setup vault balances
        token0.mint(address(seiVault), 100_000 * 1e18);
        token0.mint(address(strategyVault), 100_000 * 1e18);
        token1.mint(address(strategyVault), 100_000 * 1e18);

        // Submit request for SEI vault
        uint256 deadline = block.timestamp + 1 hours;

        bytes32 seiMessageHash = keccak256(abi.encodePacked(
            address(seiVault),
            seiTickLower,
            seiTickUpper,
            uint256(5000),
            deadline
        )).toEthSignedMessageHash();

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(signerKey, seiMessageHash);
        bytes memory seiSig = abi.encodePacked(r, s, v);

        bytes32 seiRequestId = oracle.submitRebalanceRequest(
            address(seiVault),
            seiTickLower,
            seiTickUpper,
            5000,
            deadline,
            "test_model",
            seiSig
        );

        // Submit request for Strategy vault
        bytes32 strategyMessageHash = keccak256(abi.encodePacked(
            address(strategyVault),
            strategyTickLower,
            strategyTickUpper,
            uint256(7500),
            deadline
        )).toEthSignedMessageHash();

        (v, r, s) = vm.sign(signerKey, strategyMessageHash);
        bytes memory strategySig = abi.encodePacked(r, s, v);

        bytes32 strategyRequestId = oracle.submitRebalanceRequest(
            address(strategyVault),
            strategyTickLower,
            strategyTickUpper,
            7500,
            deadline,
            "test_model",
            strategySig
        );

        // Verify separate request tracking
        assertEq(oracle.vaultRequestCount(address(seiVault)), 1, "SEI vault request count");
        assertEq(oracle.vaultRequestCount(address(strategyVault)), 1, "Strategy vault request count");
        assertEq(oracle.totalRequests(), 2, "Total requests");

        // Requests should be different
        assertTrue(seiRequestId != strategyRequestId, "Request IDs should differ");
    }
}
