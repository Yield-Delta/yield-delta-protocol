# Concentrated Liquidity Vault - Optimization Plan

## Problem Statement

**Current Performance:** 8.91% APY
**Target Performance:** 15.00% APY
**Gap:** -6.09%

## Root Cause Analysis

### Issue 1: Wide Price Range (+/-20%)
- Current range is too conservative for concentrated liquidity
- Results in low capital efficiency
- Only 3 rebalances in 90 days = missed fee opportunities

### Issue 2: High Impermanent Loss
- $771.95 IL ate most of the fee revenue ($538.91)
- Wide range means large price movements before rebalancing
- Net profit: **-$234.54** (losing money after IL)

### Issue 3: Insufficient Fee Capture
- Only $538.91 in fees over 90 days
- Wide range dilutes liquidity concentration
- Missing high-fee opportunities from tighter positions

## Proposed Solution: Tighter Range Strategy

### Change: ±8% Range (from ±20%)

**Benefits:**
- Higher capital efficiency (liquidity more concentrated)
- More frequent rebalancing captures market movements
- Reduced IL per rebalancing period
- Expected: 10-16 rebalances per 90 days (vs 3 currently)

**Trade-offs:**
- Higher gas costs (+$6.50 over 90 days)
- Requires more active management
- More sensitive to high volatility periods

### Implementation Steps

#### 1. Update Smart Contract

**File:** `contracts/src/strategies/ConcentratedLiquidityVault.sol`

```solidity
// Current (underperforming)
function _calculatePriceRange(uint256 currentPrice) internal pure returns (uint256 lower, uint256 upper) {
    lower = currentPrice * 80 / 100;  // -20%
    upper = currentPrice * 120 / 100; // +20%
}

// Proposed (optimized)
function _calculatePriceRange(uint256 currentPrice) internal pure returns (uint256 lower, uint256 upper) {
    lower = currentPrice * 92 / 100;  // -8%
    upper = currentPrice * 108 / 100; // +8%
}
```

#### 2. Deploy Updated Contract

```bash
cd contracts
forge script script/DeployConcentratedLiquidityOptimized.s.sol \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --broadcast \
  --legacy
```

#### 3. Test on Testnet

- Deploy small test position ($100)
- Monitor for 7-14 days
- Track actual:
  - Fee revenue
  - IL
  - Gas costs
  - Rebalance frequency

#### 4. Compare Results

Expected metrics after real testing:
- APY: 12-18% (meets 15% target)
- Rebalances: 1-2 per week
- Gas costs: $0.50-1.00 per week
- Net fees after IL: Positive

## Alternative Strategies (If Tighter Range Underperforms)

### Option A: Dynamic Range Based on Volatility
- Tight range (±5%) during low volatility
- Wide range (±15%) during high volatility
- Requires volatility oracle integration

### Option B: Multiple Position Tiers
- Split capital across 3 ranges: ±5%, ±10%, ±20%
- Balanced fee capture + IL protection
- More complex to manage

### Option C: Asymmetric Ranges (Trend Following)
- Bias range based on trend direction
- Example: 0.9x to 1.15x if uptrend detected
- Reduces IL in trending markets

## Backtesting Limitations

**Note:** Our backtesting showed 198% APY for the optimized strategy, but this is **inflated** due to:

1. **Synthetic pool data** - not real DragonSwap volume/fees
2. **IL calculation bug** - doesn't properly reset at each rebalance
3. **No slippage modeling** - real rebalancing has execution costs

**Real-world APY will be lower** - expect 12-18% range based on:
- Typical Uniswap V3 concentrated liquidity performance
- SEI's trading volumes
- Actual rebalancing costs

## Success Criteria

After deploying the optimized vault:

✅ **Minimum:** 12% APY (above current 8.91%)
✅ **Target:** 15% APY (original goal)
✅ **Stretch:** 18%+ APY (exceptional performance)

### Key Metrics to Monitor

1. **Fee Revenue** > $120/month on $10k position
2. **Net Profit** (Fees - IL - Gas) > $100/month
3. **Sharpe Ratio** > 0.5
4. **Max Drawdown** < 20%

## Risks & Mitigation

### Risk 1: High Volatility Periods
- **Impact:** Frequent rebalancing, high gas costs
- **Mitigation:** Implement volatility threshold to pause rebalancing

### Risk 2: Low Trading Volume
- **Impact:** Insufficient fee revenue
- **Mitigation:** Monitor pool volumes, adjust range if needed

### Risk 3: Smart Contract Bugs
- **Impact:** Loss of funds
- **Mitigation:**
  - Audit updated contract
  - Start with small test positions
  - Gradual migration of funds

## Timeline

- **Week 1:** Update & audit contract code
- **Week 2:** Deploy to testnet, start small test
- **Week 3-4:** Monitor performance, gather data
- **Week 5:** Full deployment if metrics meet targets

## Recommendation

**Proceed with ±8% range optimization:**

1. ✅ Clear theoretical basis (higher capital efficiency)
2. ✅ Proven strategy in Uniswap V3 ecosystem
3. ✅ Low risk (can revert if underperforms)
4. ✅ Measurable improvement expected

The tighter range strategy is the most straightforward path to achieving the 15% APY target while maintaining the core concentrated liquidity approach.

---

**Document Status:** Draft for Review
**Last Updated:** November 26, 2025
**Next Review:** After testnet deployment results
