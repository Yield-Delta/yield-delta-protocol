// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../../../src/EnhancedStrategyVault.sol";
import "../../../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../InvariantBase.sol";

/**
 * @title EnhancedVaultHandler
 * @dev Handler for stateful fuzz testing of EnhancedStrategyVault
 * @notice Tests enhanced features: fee collection, yield distribution, lock periods
 */
contract EnhancedVaultHandler is Test {
    EnhancedStrategyVault public vault;
    MockERC20Invariant public token0;
    MockERC20Invariant public token1;

    // Actors
    address[] public actors;
    address public aiOracle;
    address internal currentActor;

    // Ghost variables
    uint256 public ghost_totalDeposits0;
    uint256 public ghost_totalDeposits1;
    uint256 public ghost_totalWithdrawals0;
    uint256 public ghost_totalWithdrawals1;
    uint256 public ghost_sharesMinted;
    uint256 public ghost_sharesBurned;
    uint256 public ghost_withdrawalFeesCollected;
    uint256 public ghost_managementFeesMinted;

    // Per-actor tracking
    mapping(address => uint256) public ghost_actorDeposits0;
    mapping(address => uint256) public ghost_actorDeposits1;
    mapping(address => uint256) public ghost_actorShares;
    mapping(address => uint256) public ghost_actorDepositTime;

    // Call counters
    uint256 public depositCalls;
    uint256 public withdrawCalls;
    uint256 public rebalanceCalls;
    uint256 public yieldDistributionCalls;
    uint256 public lockPeriodUpdateCalls;
    uint256 public failedCalls;

    // Rebalance tracking
    int24 public lastTickLower;
    int24 public lastTickUpper;
    uint256 public lastRebalanceTime;

    // SEI Chain ID
    uint256 internal constant SEI_CHAIN_ID = 1328;
    uint256 internal constant MIN_REBALANCE_INTERVAL = 3600;

    constructor(
        EnhancedStrategyVault _vault,
        MockERC20Invariant _token0,
        MockERC20Invariant _token1,
        address[] memory _actors,
        address _aiOracle
    ) {
        vault = _vault;
        token0 = _token0;
        token1 = _token1;
        actors = _actors;
        aiOracle = _aiOracle;
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
     * @dev Deposit both tokens into the vault
     * @param actorSeed Seed for selecting actor
     * @param amount0 Amount of token0 to deposit
     * @param amount1 Amount of token1 to deposit
     */
    function deposit(uint256 actorSeed, uint256 amount0, uint256 amount1)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        // Bound amounts
        amount0 = bound(amount0, 1e18, 50_000 * 1e18);
        amount1 = bound(amount1, 1e18, 50_000 * 1e18);

        // Ensure actor has tokens
        _ensureTokenBalance(currentActor, amount0, amount1);

        // Approve vault
        token0.approve(address(vault), amount0);
        token1.approve(address(vault), amount1);

        // Record pre-state
        uint256 preShares = vault.balanceOf(currentActor);
        uint256 preTotalSupply = vault.totalSupply();
        uint256 preOwnerShares = vault.balanceOf(vault.owner());

        // Execute deposit
        try vault.deposit(amount0, amount1, currentActor) returns (uint256 shares) {
            depositCalls++;

            // Update ghost variables
            ghost_totalDeposits0 += amount0;
            ghost_totalDeposits1 += amount1;
            ghost_sharesMinted += shares;
            ghost_actorDeposits0[currentActor] += amount0;
            ghost_actorDeposits1[currentActor] += amount1;
            ghost_actorShares[currentActor] += shares;
            ghost_actorDepositTime[currentActor] = block.timestamp;

            // Track management fee minting
            uint256 newOwnerShares = vault.balanceOf(vault.owner());
            if (newOwnerShares > preOwnerShares) {
                ghost_managementFeesMinted += newOwnerShares - preOwnerShares;
            }

            // Verify share minting
            assert(vault.balanceOf(currentActor) >= preShares);
            assert(vault.totalSupply() >= preTotalSupply);

        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Withdraw tokens from the vault
     * @param actorSeed Seed for selecting actor
     * @param sharePercent Percentage of shares to withdraw
     */
    function withdraw(uint256 actorSeed, uint256 sharePercent)
        external
        useActor(actorSeed)
        ensureSEIChain
    {
        uint256 actorShares = vault.balanceOf(currentActor);
        if (actorShares == 0) return;

        sharePercent = bound(sharePercent, 1, 100);
        uint256 sharesToWithdraw = (actorShares * sharePercent) / 100;
        if (sharesToWithdraw == 0) sharesToWithdraw = 1;

        // Ensure lock period has passed
        uint256 depositTime = ghost_actorDepositTime[currentActor];
        uint256 lockPeriod = vault.minimumLockPeriod();
        if (depositTime > 0 && block.timestamp < depositTime + lockPeriod) {
            vm.warp(depositTime + lockPeriod + 1);
        }

        // Record pre-state
        uint256 preShares = vault.balanceOf(currentActor);
        uint256 preToken0 = token0.balanceOf(currentActor);
        uint256 preToken1 = token1.balanceOf(currentActor);
        uint256 preVaultToken0 = token0.balanceOf(address(vault));
        uint256 preVaultToken1 = token1.balanceOf(address(vault));

        // Execute withdraw
        try vault.withdraw(sharesToWithdraw, currentActor) returns (uint256 amount0, uint256 amount1) {
            withdrawCalls++;

            // Calculate withdrawal fees (0.5%)
            uint256 grossAmount0 = (sharesToWithdraw * preVaultToken0) / vault.totalSupply() + sharesToWithdraw;
            uint256 grossAmount1 = (sharesToWithdraw * preVaultToken1) / vault.totalSupply() + sharesToWithdraw;

            // Update ghost variables
            ghost_totalWithdrawals0 += amount0;
            ghost_totalWithdrawals1 += amount1;
            ghost_sharesBurned += sharesToWithdraw;
            ghost_actorShares[currentActor] -= sharesToWithdraw;

            // Track fees (actual received vs gross)
            if (grossAmount0 > amount0) {
                ghost_withdrawalFeesCollected += (grossAmount0 - amount0);
            }
            if (grossAmount1 > amount1) {
                ghost_withdrawalFeesCollected += (grossAmount1 - amount1);
            }

            // Verify withdrawals
            assert(vault.balanceOf(currentActor) == preShares - sharesToWithdraw);
            assert(token0.balanceOf(currentActor) >= preToken0);
            assert(token1.balanceOf(currentActor) >= preToken1);

        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Trigger AI rebalance
     * @param newTickLower New lower tick
     * @param newTickUpper New upper tick
     * @param deadline Deadline for execution
     */
    function rebalance(int24 newTickLower, int24 newTickUpper, uint256 deadline)
        external
        ensureSEIChain
    {
        // Bound tick values
        newTickLower = int24(bound(int256(newTickLower), -887272, 887272));
        newTickUpper = int24(bound(int256(newTickUpper), newTickLower + 1, 887272));

        // Ensure deadline is in future
        deadline = bound(deadline, block.timestamp + 1, block.timestamp + 1 hours);

        // Check rebalance interval
        if (lastRebalanceTime > 0 && block.timestamp < lastRebalanceTime + MIN_REBALANCE_INTERVAL) {
            vm.warp(lastRebalanceTime + MIN_REBALANCE_INTERVAL + 1);
        }

        // Create rebalance params
        IStrategyVault.AIRebalanceParams memory params = IStrategyVault.AIRebalanceParams({
            newTickLower: newTickLower,
            newTickUpper: newTickUpper,
            minAmount0: 0,
            minAmount1: 0,
            deadline: deadline,
            aiSignature: ""
        });

        vm.prank(aiOracle);
        try vault.rebalance(params) {
            rebalanceCalls++;
            lastTickLower = newTickLower;
            lastTickUpper = newTickUpper;
            lastRebalanceTime = block.timestamp;
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Distribute yield (owner only)
     */
    function distributeYield() external ensureSEIChain {
        yieldDistributionCalls++;

        vm.prank(vault.owner());
        try vault.distributeYield() {
            // Yield distributed
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Update minimum lock period (owner only)
     * @param newPeriodSeed Seed for new period
     */
    function setMinimumLockPeriod(uint256 newPeriodSeed) external ensureSEIChain {
        lockPeriodUpdateCalls++;

        // Bound to max 30 days as per contract
        uint256 newPeriod = bound(newPeriodSeed, 0, 30 days);

        vm.prank(vault.owner());
        try vault.setMinimumLockPeriod(newPeriod) {
            // Period updated
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Pause the vault
     */
    function emergencyPause() external {
        vm.prank(vault.owner());
        try vault.emergencyPause() {
            // Vault paused
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Resume the vault
     */
    function resume() external {
        vm.prank(vault.owner());
        try vault.resume() {
            // Vault resumed
        } catch {
            failedCalls++;
        }
    }

    /**
     * @dev Advance time
     * @param timeJump Seconds to advance
     */
    function warpTime(uint256 timeJump) external {
        timeJump = bound(timeJump, 1, 7 days);
        vm.warp(block.timestamp + timeJump);
    }

    /**
     * @dev Helper to ensure actor has sufficient token balance
     */
    function _ensureTokenBalance(address actor, uint256 amount0, uint256 amount1) internal {
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
     * @dev Get call summary
     */
    function callSummary() external view returns (
        uint256 deposits,
        uint256 withdraws,
        uint256 rebalances,
        uint256 yieldDist,
        uint256 lockUpdates,
        uint256 failed
    ) {
        return (
            depositCalls,
            withdrawCalls,
            rebalanceCalls,
            yieldDistributionCalls,
            lockPeriodUpdateCalls,
            failedCalls
        );
    }
}
