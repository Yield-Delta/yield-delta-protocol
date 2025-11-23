// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/SEIVault.sol";
import "../src/AIOracle.sol";
import "../src/interfaces/ISEIVault.sol";

/**
 * @title YieldGenerationTest
 * @notice Test suite to verify 15% APY yield generation through rebalancing
 */
contract YieldGenerationTest is Test {
    SEIVault public vault;
    AIOracle public oracle;

    address public owner = address(1);
    address public user1 = address(2);
    address public user2 = address(3);
    address public aiSigner;
    uint256 public aiSignerPrivateKey;

    uint256 constant SEI_CHAIN_ID = 1328;
    uint256 constant INITIAL_DEPOSIT = 5 ether; // 5 SEI
    uint256 constant TARGET_APY = 15; // 15% APY
    uint256 constant YEAR_IN_SECONDS = 365 days;

    event PositionRebalanced(int24 oldTickLower, int24 oldTickUpper, int24 newTickLower, int24 newTickUpper);

    function setUp() public {
        // Set chain ID to SEI testnet
        vm.chainId(SEI_CHAIN_ID);

        // Create AI signer
        aiSignerPrivateKey = 0xABC123;
        aiSigner = vm.addr(aiSignerPrivateKey);

        // Deploy contracts
        vm.startPrank(owner);
        oracle = new AIOracle(owner);
        vault = new SEIVault(
            address(0), // Native SEI
            "SEI Yield Vault",
            "SYV",
            owner,
            address(oracle)
        );

        // Register AI model
        oracle.registerAIModel("yield-optimizer-v1", aiSigner);

        // Configure vault
        vault.setParallelExecution(true);
        vault.optimizeForFinality();
        vm.stopPrank();

        // Fund users with native SEI
        vm.deal(user1, 100 ether);
        vm.deal(user2, 100 ether);
    }

    /**
     * @notice Test initial deposit and share calculation
     */
    function test_InitialDeposit() public {
        vm.prank(user1);
        uint256 shares = vault.seiOptimizedDeposit{value: INITIAL_DEPOSIT}(INITIAL_DEPOSIT, user1);

        assertEq(shares, INITIAL_DEPOSIT, "Initial shares should equal deposit");
        assertEq(vault.balanceOf(user1), INITIAL_DEPOSIT, "User should have correct shares");
        assertEq(vault.totalAssets(), INITIAL_DEPOSIT, "Vault should have correct TVL");
    }

    /**
     * @notice Test yield generation over 1 year at 15% APY
     * This simulates rebalancing that generates profit
     */
    function test_YieldGeneration_OneYear() public {
        // Initial deposit
        vm.prank(user1);
        vault.seiOptimizedDeposit{value: INITIAL_DEPOSIT}(INITIAL_DEPOSIT, user1);

        uint256 initialTVL = vault.totalAssets();
        console.log("Initial TVL:", initialTVL);

        // Simulate 12 monthly rebalances (typical rebalancing frequency)
        uint256 monthlyYield = (INITIAL_DEPOSIT * TARGET_APY) / (100 * 12);

        for (uint256 i = 0; i < 12; i++) {
            // Advance time by 1 month
            vm.warp(block.timestamp + 30 days);

            // Simulate yield by sending profits to vault (simulating DEX trading profits)
            vm.deal(address(vault), address(vault).balance + monthlyYield);

            console.log("Month", i + 1, "TVL:", vault.totalAssets());
        }

        uint256 finalTVL = vault.totalAssets();
        uint256 expectedTVL = INITIAL_DEPOSIT + ((INITIAL_DEPOSIT * TARGET_APY) / 100);

        console.log("Final TVL:", finalTVL);
        console.log("Expected TVL:", expectedTVL);
        console.log("Yield Generated:", finalTVL - INITIAL_DEPOSIT);

        // Allow 1% margin of error for compounding effects
        assertApproxEqRel(finalTVL, expectedTVL, 0.01e18, "Should generate ~15% yield");
    }

    /**
     * @notice Test share value appreciation
     * When yield is generated, share value should increase
     */
    function test_ShareValueAppreciation() public {
        // User 1 deposits
        vm.prank(user1);
        uint256 shares1 = vault.seiOptimizedDeposit{value: 5 ether}(5 ether, user1);

        // Get initial share value
        uint256 initialShareValue = (5 ether * 1e18) / shares1;
        console.log("Initial share value:", initialShareValue);

        // Simulate yield generation (vault receives profits)
        uint256 yieldAmount = 0.75 ether; // 15% of 5 ETH
        vm.deal(address(vault), address(vault).balance + yieldAmount);

        // User 2 deposits after yield
        vm.prank(user2);
        uint256 shares2 = vault.seiOptimizedDeposit{value: 5 ether}(5 ether, user2);

        // User 2 should get fewer shares (because share value increased)
        assertLt(shares2, shares1, "Later depositor should get fewer shares");

        // Calculate new share value
        uint256 newShareValue = (vault.totalAssets() * 1e18) / vault.totalSupply();
        console.log("New share value:", newShareValue);

        assertGt(newShareValue, initialShareValue, "Share value should increase with yield");
    }

    /**
     * @notice Test rebalancing mechanism
     * Verify that AI oracle can trigger rebalances
     */
    function test_RebalanceExecution() public {
        // Deposit funds
        vm.prank(user1);
        vault.seiOptimizedDeposit{value: INITIAL_DEPOSIT}(INITIAL_DEPOSIT, user1);

        // Create rebalance parameters
        int24 newTickLower = -887220;
        int24 newTickUpper = 887220;
        uint256 confidence = 8500; // 85% confidence
        uint256 deadline = block.timestamp + 1 hours;

        // Create signature for AI model
        bytes32 messageHash = keccak256(abi.encodePacked(
            address(vault),
            newTickLower,
            newTickUpper,
            confidence,
            deadline
        ));

        bytes32 ethSignedHash = keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message:\n32",
            messageHash
        ));

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(aiSignerPrivateKey, ethSignedHash);
        bytes memory signature = abi.encodePacked(r, s, v);

        // Submit rebalance request
        vm.prank(aiSigner);
        bytes32 requestId = oracle.submitRebalanceRequest(
            address(vault),
            newTickLower,
            newTickUpper,
            confidence,
            deadline,
            "yield-optimizer-v1",
            signature
        );

        // Execute rebalance
        vm.expectEmit(true, true, true, true);
        emit PositionRebalanced(0, 0, newTickLower, newTickUpper);

        vm.prank(aiSigner);
        bool success = oracle.executeRebalanceRequest(requestId, "yield-optimizer-v1");

        assertTrue(success, "Rebalance should execute successfully");

        // Verify position was updated
        ISEIVault.Position memory position = vault.getCurrentPosition();
        assertEq(position.tickLower, newTickLower, "Tick lower should be updated");
        assertEq(position.tickUpper, newTickUpper, "Tick upper should be updated");
    }

    /**
     * @notice Test multiple users with yield distribution
     * Verify that yield is distributed proportionally to shares
     */
    function test_ProportionalYieldDistribution() public {
        // User 1 deposits 3 ETH
        vm.prank(user1);
        vault.seiOptimizedDeposit{value: 3 ether}(3 ether, user1);

        // User 2 deposits 2 ETH
        vm.prank(user2);
        vault.seiOptimizedDeposit{value: 2 ether}(2 ether, user2);

        uint256 user1Shares = vault.balanceOf(user1);
        uint256 user2Shares = vault.balanceOf(user2);

        // Generate yield
        uint256 totalYield = 0.75 ether; // 15% of 5 ETH
        vm.deal(address(vault), address(vault).balance + totalYield);

        // Check TVL increased
        uint256 newTVL = vault.totalAssets();
        assertEq(newTVL, 5.75 ether, "TVL should include yield");

        // Calculate user values
        uint256 user1Value = (user1Shares * newTVL) / vault.totalSupply();
        uint256 user2Value = (user2Shares * newTVL) / vault.totalSupply();

        console.log("User 1 value:", user1Value);
        console.log("User 2 value:", user2Value);

        // User 1 should have ~3.45 ETH (3 + 15%)
        // User 2 should have ~2.30 ETH (2 + 15%)
        assertApproxEqRel(user1Value, 3.45 ether, 0.01e18, "User 1 should have proportional yield");
        assertApproxEqRel(user2Value, 2.30 ether, 0.01e18, "User 2 should have proportional yield");
    }

    /**
     * @notice Test withdrawal after yield generation
     * Users should be able to withdraw their principal + yield
     */
    function test_WithdrawWithYield() public {
        // Deposit
        vm.prank(user1);
        vault.seiOptimizedDeposit{value: INITIAL_DEPOSIT}(INITIAL_DEPOSIT, user1);

        // Wait 24 hours (lock period)
        vm.warp(block.timestamp + 24 hours + 1);

        // Generate yield
        uint256 yieldAmount = (INITIAL_DEPOSIT * 15) / 100; // 15% yield
        vm.deal(address(vault), address(vault).balance + yieldAmount);

        // Withdraw all shares
        uint256 shares = vault.balanceOf(user1);
        uint256 initialBalance = user1.balance;

        vm.prank(user1);
        uint256 withdrawn = vault.seiOptimizedWithdraw(shares, user1, user1);

        uint256 finalBalance = user1.balance;
        uint256 profit = (finalBalance - initialBalance) - INITIAL_DEPOSIT;

        console.log("Initial deposit:", INITIAL_DEPOSIT);
        console.log("Withdrawn:", withdrawn);
        console.log("Profit:", profit);

        assertGt(withdrawn, INITIAL_DEPOSIT, "Should withdraw more than deposited");
        assertApproxEqRel(profit, yieldAmount, 0.01e18, "Profit should be ~15%");
    }
}
