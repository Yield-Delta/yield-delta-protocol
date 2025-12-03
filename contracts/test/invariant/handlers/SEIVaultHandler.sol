// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../../src/SEIVault.sol";
import "../../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../InvariantBase.sol";

/**
 * @title SEIVaultHandler
 * @dev Handler contract for stateful fuzz testing of SEIVault
 * @notice Exposes bounded actions that the fuzzer can call
 */
contract SEIVaultHandler is Test {
    SEIVault public vault;
    MockERC20Invariant public token;

    // Actors
    address[] public actors;
    address internal currentActor;

    // Ghost variables for tracking state
    uint256 public ghost_depositSum;
    uint256 public ghost_withdrawSum;
    uint256 public ghost_sharesMinted;
    uint256 public ghost_sharesBurned;

    // Per-actor tracking
    mapping(address => uint256) public ghost_actorDeposits;
    mapping(address => uint256) public ghost_actorWithdrawals;
    mapping(address => uint256) public ghost_actorShares;

    // Call counters
    uint256 public depositCalls;
    uint256 public withdrawCalls;
    uint256 public failedDeposits;
    uint256 public failedWithdrawals;

    // Time tracking for lock period testing
    mapping(address => uint256) public actorDepositTime;

    // SEI Chain ID
    uint256 internal constant SEI_CHAIN_ID = 1328;

    constructor(SEIVault _vault, MockERC20Invariant _token, address[] memory _actors) {
        vault = _vault;
        token = _token;
        actors = _actors;
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
     * @dev Deposit tokens into the vault
     * @param actorSeed Seed for selecting actor
     * @param amount Amount to deposit (will be bounded)
     */
    function deposit(uint256 actorSeed, uint256 amount)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        // Bound amount to reasonable values
        amount = bound(amount, 1e18, 100_000 * 1e18);

        // Ensure actor has enough tokens
        uint256 balance = token.balanceOf(currentActor);
        if (balance < amount) {
            token.mint(currentActor, amount - balance + 1e18);
        }

        // Approve vault
        token.approve(address(vault), amount);

        // Record pre-state
        uint256 preShares = vault.balanceOf(currentActor);
        uint256 preTotalSupply = vault.totalSupply();

        // Execute deposit
        try vault.seiOptimizedDeposit(amount, currentActor) returns (uint256 shares) {
            depositCalls++;

            // Update ghost variables
            ghost_depositSum += amount;
            ghost_sharesMinted += shares;
            ghost_actorDeposits[currentActor] += amount;
            ghost_actorShares[currentActor] += shares;

            // Track deposit time for lock period
            if (actorDepositTime[currentActor] == 0) {
                actorDepositTime[currentActor] = block.timestamp;
            }

            // Verify post-conditions
            assert(vault.balanceOf(currentActor) == preShares + shares);
            assert(vault.totalSupply() == preTotalSupply + shares);

        } catch {
            failedDeposits++;
        }
    }

    /**
     * @dev Withdraw tokens from the vault
     * @param actorSeed Seed for selecting actor
     * @param sharePercent Percentage of shares to withdraw (0-100)
     */
    function withdraw(uint256 actorSeed, uint256 sharePercent)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        uint256 actorShares = vault.balanceOf(currentActor);
        if (actorShares == 0) return;

        // Calculate shares to withdraw based on percentage
        sharePercent = bound(sharePercent, 1, 100);
        uint256 sharesToWithdraw = (actorShares * sharePercent) / 100;
        if (sharesToWithdraw == 0) sharesToWithdraw = 1;

        // Check if lock period has passed
        uint256 depositTime = actorDepositTime[currentActor];
        if (depositTime > 0 && block.timestamp < depositTime + 24 hours) {
            // Warp time to after lock period
            vm.warp(depositTime + 24 hours + 1);
        }

        // Record pre-state
        uint256 preShares = vault.balanceOf(currentActor);
        uint256 preTotalSupply = vault.totalSupply();
        uint256 preTokenBalance = token.balanceOf(currentActor);

        // Execute withdraw
        try vault.seiOptimizedWithdraw(sharesToWithdraw, currentActor, currentActor) returns (uint256 assets) {
            withdrawCalls++;

            // Update ghost variables
            ghost_withdrawSum += assets;
            ghost_sharesBurned += sharesToWithdraw;
            ghost_actorWithdrawals[currentActor] += assets;
            ghost_actorShares[currentActor] -= sharesToWithdraw;

            // Verify post-conditions
            assert(vault.balanceOf(currentActor) == preShares - sharesToWithdraw);
            assert(vault.totalSupply() == preTotalSupply - sharesToWithdraw);
            assert(token.balanceOf(currentActor) >= preTokenBalance);

        } catch {
            failedWithdrawals++;
        }
    }

    /**
     * @dev Transfer shares between actors
     * @param fromSeed Seed for selecting sender
     * @param toSeed Seed for selecting recipient
     * @param sharePercent Percentage of shares to transfer
     */
    function transfer(uint256 fromSeed, uint256 toSeed, uint256 sharePercent)
        external
        ensureSEIChain
    {
        address from = actors[bound(fromSeed, 0, actors.length - 1)];
        address to = actors[bound(toSeed, 0, actors.length - 1)];

        if (from == to) return;

        uint256 fromShares = vault.balanceOf(from);
        if (fromShares == 0) return;

        sharePercent = bound(sharePercent, 1, 100);
        uint256 sharesToTransfer = (fromShares * sharePercent) / 100;
        if (sharesToTransfer == 0) sharesToTransfer = 1;

        uint256 preFromShares = vault.balanceOf(from);
        uint256 preToShares = vault.balanceOf(to);

        vm.prank(from);
        vault.transfer(to, sharesToTransfer);

        // Ghost variable updates
        ghost_actorShares[from] -= sharesToTransfer;
        ghost_actorShares[to] += sharesToTransfer;

        // Verify conservation
        assert(vault.balanceOf(from) + vault.balanceOf(to) == preFromShares + preToShares);
    }

    /**
     * @dev Advance time to test time-dependent functionality
     * @param timeJump Number of seconds to advance
     */
    function warpTime(uint256 timeJump) external {
        timeJump = bound(timeJump, 1, 7 days);
        vm.warp(block.timestamp + timeJump);
    }

    /**
     * @dev Get summary of handler activity
     */
    function callSummary() external view returns (
        uint256 deposits,
        uint256 withdraws,
        uint256 failedDeps,
        uint256 failedWiths,
        uint256 totalDeposited,
        uint256 totalWithdrawn
    ) {
        return (
            depositCalls,
            withdrawCalls,
            failedDeposits,
            failedWithdrawals,
            ghost_depositSum,
            ghost_withdrawSum
        );
    }

    /**
     * @dev Reduce call targets to only meaningful functions
     */
    function reduceActors(uint256 num) external view returns (address[] memory) {
        uint256 len = num > actors.length ? actors.length : num;
        address[] memory reduced = new address[](len);
        for (uint256 i = 0; i < len; i++) {
            reduced[i] = actors[i];
        }
        return reduced;
    }
}
