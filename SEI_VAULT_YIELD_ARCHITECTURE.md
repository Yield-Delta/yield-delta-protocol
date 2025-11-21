# SEIVault Yield Generation Architecture

## Overview

The SEIVault is an **AI-driven dynamic liquidity vault** optimized for SEI's 400ms finality. It generates yield through multiple strategies orchestrated by the Kairos AI agent system via the `plugin-sei-yield-delta` plugin.

## Architecture Components

### 1. Smart Contract Layer (SEIVault.sol)

The vault contract itself is a **passive container** that:
- Accepts deposits of native SEI or ERC20 tokens
- Issues shares to depositors (1:1 ratio on initial deposits)
- Allows AI-controlled rebalancing via the `aiOracle` address
- Charges management fee (1%) and performance fee (10%)

**Important**: The vault contract does NOT actively generate yield. It provides the infrastructure for:
- Secure custody of deposited assets
- Share token minting/burning
- AI-triggered position rebalancing

```solidity
// Key vault features
address public aiOracle;              // AI can trigger rebalancing
uint256 public constant MANAGEMENT_FEE = 100;   // 1%
uint256 public constant PERFORMANCE_FEE = 1000; // 10%
```

### 2. Yield Generation Engine (plugin-sei-yield-delta)

The actual yield generation happens through the Kairos AI agent using multiple integrated strategies:

---

## Yield Generation Strategies

### Strategy 1: Funding Rate Arbitrage
**File**: `actions/funding-arbitrage.ts`
**Expected APR**: 10-30%+

This strategy captures funding rate differentials between CEX and DEX:

1. **Scan Opportunities**: Monitor funding rates across exchanges (Binance, Bybit, etc.)
2. **Identify Arbitrage**: Find symbols where CEX funding rates differ significantly
3. **Open Hedged Positions**:
   - Long on one venue where you receive funding
   - Short on another venue where you pay less
4. **Collect Funding**: Earn the differential 3x daily (8-hour intervals)

```typescript
// Example opportunity
{
  symbol: 'BTC',
  cexSide: 'short',           // Short on CEX
  dexSide: 'long',            // Long on DragonSwap
  expectedReturn: 0.15,       // 15% annual
  hedgeAction: 'long_dex'     // Hedge by going long on DEX
}
```

### Strategy 2: Delta Neutral Positions
**File**: `actions/delta-neutral.ts`
**Expected APR**: 10-20%

Combines LP positions with perpetual hedging:

1. **Provide Liquidity**: Add to concentrated liquidity pools
2. **Hedge Price Risk**: Open perp positions to neutralize directional exposure
3. **Earn From**:
   - LP trading fees
   - Funding rate collection
   - Volatility capture

The AI optimizes:
- Hedge ratio (typically 50-95%)
- Price range for LP positions
- Rebalancing frequency

### Strategy 3: AMM Optimization
**File**: `actions/amm-optimize.ts`
**Expected APR**: 5-15%

AI-driven concentrated liquidity management:

1. **Position Analysis**: Current tick ranges vs market conditions
2. **Optimal Range Prediction**: AI predicts best lower/upper ticks
3. **Rebalancing**: Adjust positions when price moves out of range

```typescript
// AI optimization request
{
  vault_address: '0x...',
  current_price: 2500,
  volatility: 0.3,
  volume_24h: 1000000
}

// AI response
{
  lower_tick: 1800,
  upper_tick: 2200,
  expected_apr: 0.12,
  confidence: 0.85
}
```

### Strategy 4: YEI Finance Lending Integration
**File**: `actions/yei-finance.ts`
**Expected APR**: 3-8%

Lending protocol integration for base yield:

- Multi-oracle price feeds (API3, Pyth, Redstone)
- Collateralized lending and borrowing
- Interest rate optimization
- Liquidation protection

### Strategy 5: Portfolio Rebalancing
**File**: `actions/rebalance.ts`
**Expected APR**: Varies

Systematic asset allocation management:

- Conservative DeFi: 40% SEI, 30% USDC, 20% ETH, 10% BTC
- Balanced Growth: Diversified DeFi exposure
- Aggressive DeFi: Higher allocation to volatile assets
- Yield Farming Focus: 25% LP tokens

---

## How Vault Operations Interact with Plugin

### Deposit Flow

1. User deposits SEI into vault
2. Vault mints shares to user
3. AI agent (via aiOracle) allocates deposited funds:
   - Portion to funding arbitrage positions
   - Portion to concentrated LP positions
   - Portion to lending protocols
   - Reserve for liquidity

### Yield Accrual

1. **Every 8 hours**: Funding rates collected
2. **Continuously**: LP fees accumulate
3. **Periodically**: AI rebalances positions for optimal yield
4. **Result**: Vault's total assets grow, increasing share value

### Withdrawal Flow

1. User requests withdrawal of shares
2. Vault calculates assets owed: `(shares * totalAssets) / totalSupply`
3. If necessary, AI unwinds positions to free liquidity
4. User receives assets (after 24-hour lock period)

---

## Current Vault vs Plugin Integration

### What the SEIVault Contract Does:
- ✅ Accepts deposits
- ✅ Issues/burns shares
- ✅ Tracks customer stats
- ✅ Enforces lock period (24 hours)
- ✅ Allows AI-triggered rebalancing
- ❌ Does NOT actively trade
- ❌ Does NOT manage positions

### What plugin-sei-yield-delta Does:
- ✅ Executes funding arbitrage
- ✅ Manages delta neutral positions
- ✅ Optimizes AMM positions
- ✅ Interacts with YEI Finance
- ✅ Performs portfolio rebalancing
- ⚠️ Currently operates as standalone strategies
- ⚠️ Not directly integrated with deployed SEIVault contract

---

## Gap Analysis: Current State

### Current Implementation:
1. **Vault Contract**: Deployed and functional for deposits/withdrawals
2. **Plugin Actions**: Implemented but operate independently
3. **Missing Link**: The plugin doesn't automatically deposit/withdraw from vault positions

### What Would Complete the Integration:

```typescript
// Theoretical integration point
interface VaultYieldManager {
  // Plugin should track vault deposits
  onDeposit(vaultAddress: string, amount: bigint): void;

  // Allocate new deposits to strategies
  allocateToStrategies(amount: bigint): void;

  // Return yield to vault
  harvestAndCompound(): void;

  // Free up liquidity for withdrawals
  prepareWithdrawal(amount: bigint): void;
}
```

---

## Projected Yield Breakdown (15% APY Target)

| Strategy | Allocation | Expected APR | Contribution |
|----------|------------|--------------|--------------|
| Funding Arbitrage | 40% | 20% | 8.0% |
| Delta Neutral LP | 30% | 12% | 3.6% |
| AMM Optimization | 20% | 10% | 2.0% |
| YEI Lending | 10% | 5% | 0.5% |
| **Total** | **100%** | - | **14.1%** |

After fees (1% management + 10% performance):
- Gross Yield: ~15.7%
- Net to User: ~14.1%
- **Displayed APY: 15%** (includes some buffer)

---

## Geographic Strategy Routing (US vs Global)

The plugin includes a **GeographicTradingRouter** (`providers/geographic-routing.ts`) that automatically selects the appropriate perpetual trading venue based on user location and regulatory requirements.

### Configuration

```typescript
interface GeographicConfig {
  USER_GEOGRAPHY: 'US' | 'EU' | 'ASIA' | 'GLOBAL';
  PERP_PREFERENCE: 'GEOGRAPHIC' | 'GLOBAL' | 'COINBASE_ONLY' | 'ONCHAIN_ONLY';
  COINBASE_ADVANCED_API_KEY?: string;
  COINBASE_ADVANCED_SECRET?: string;
  COINBASE_ADVANCED_PASSPHRASE?: string;
}
```

---

## US Strategy (Regulatory Compliant)

### Primary Perp Provider: **Coinbase Advanced**
**File**: `providers/coinbase-advanced.ts`

For US-based users, the system automatically routes perpetual trades through Coinbase Advanced Trade API, which is fully regulated and compliant with US securities laws.

#### Features:
- ✅ Regulated exchange (US compliant)
- ✅ Perpetual futures contracts
- ✅ IL protection hedging
- ✅ API-based execution
- ✅ Sandbox mode for testing

#### Supported Operations:
```typescript
// Open perp position for hedging
await coinbaseProvider.openPerpPosition({
  symbol: 'BTC-USD',
  size: '1000',
  side: 'short',
  leverage: 1,
  slippage: 50
});

// Get hedge recommendation for LP position
const hedge = await coinbaseProvider.getHedgeRecommendation(lpPosition);
// Returns: hedgeRatio, expectedILReduction, symbol, size, action
```

#### US Strategy Flow:
1. User deposits to vault
2. AI allocates to LP positions on SEI DEXes
3. Geographic router detects US user
4. Opens hedge positions via **Coinbase Advanced**
5. Collects LP fees + funding payments

#### Environment Variables (US):
```bash
USER_GEOGRAPHY=US
PERP_PREFERENCE=COINBASE_ONLY
COINBASE_ADVANCED_API_KEY=your-key
COINBASE_ADVANCED_SECRET=your-secret
COINBASE_ADVANCED_PASSPHRASE=your-passphrase
COINBASE_SANDBOX=false
```

---

## Global Strategy (Non-US)

### Primary Perp Providers: **On-Chain Perps**

For users outside the US, the system can access global perpetual exchanges and on-chain derivatives.

#### On-Chain Options:
1. **Vortex Protocol** (SEI native perps)
2. **DragonSwap Perps** (SEI ecosystem)
3. Other CEX options: Bybit, Binance (where legally available)

#### Configuration for Global Users:
```bash
USER_GEOGRAPHY=GLOBAL  # or EU, ASIA
PERP_PREFERENCE=GLOBAL
PERP_PROTOCOL=vortex   # or dragonswap
VORTEX_TESTNET_CONTRACT=0x...
VORTEX_MAINNET_CONTRACT=0x...
```

#### Global Strategy Flow:
1. User deposits to vault
2. AI allocates to LP positions
3. Geographic router detects non-US user
4. Opens hedge positions via **on-chain perps** (Vortex/DragonSwap)
5. Full DeFi-native execution

---

## Strategy Comparison by Region

| Feature | US (Coinbase) | Global (On-Chain) |
|---------|---------------|-------------------|
| **Regulatory Status** | Fully regulated | Varies by jurisdiction |
| **Execution** | CEX API | On-chain transactions |
| **Settlement** | Custodial | Non-custodial |
| **Available Assets** | BTC, ETH, SOL, etc. | SEI ecosystem tokens |
| **Funding Rates** | 8-hour | Protocol-specific |
| **Max Leverage** | Up to 10x | Varies (often higher) |
| **KYC Required** | Yes (Coinbase account) | No |
| **Gas Costs** | None (CEX) | SEI gas fees |

---

## Provider Selection Logic

The `GeographicTradingRouter` automatically selects providers:

```typescript
async getBestPerpProvider(): Promise<PerpProvider> {
  const geography = this.config.USER_GEOGRAPHY;

  switch (geography) {
    case 'US':
      // Prefer Coinbase for regulatory compliance
      if (this.coinbaseProvider) {
        return this.createCoinbaseWrapper();
      }
      // Fallback to on-chain if Coinbase not available
      return this.createOnChainWrapper();

    case 'EU':
    case 'ASIA':
    case 'GLOBAL':
      // Can use global exchanges or on-chain
      return this.createOnChainWrapper();
  }
}
```

---

## Yield Breakdown by Region

### US Users (Coinbase Perps)

| Strategy | Allocation | Expected APR | Notes |
|----------|------------|--------------|-------|
| Funding Arbitrage | 35% | 15-25% | SEI LP + Coinbase hedge |
| Delta Neutral LP | 35% | 10-15% | Coinbase perp hedging |
| AMM Optimization | 20% | 8-12% | On-chain LP only |
| YEI Lending | 10% | 3-8% | Base yield |
| **Total Expected** | **100%** | **12-18%** | Slightly lower due to CEX fees |

### Global Users (On-Chain Perps)

| Strategy | Allocation | Expected APR | Notes |
|----------|------------|--------------|-------|
| Funding Arbitrage | 40% | 18-30% | Full DEX/CEX arbitrage |
| Delta Neutral LP | 30% | 12-20% | On-chain perp hedging |
| AMM Optimization | 20% | 10-15% | Full optimization |
| YEI Lending | 10% | 3-8% | Base yield |
| **Total Expected** | **100%** | **15-22%** | Higher due to more venues |

---

## Implementation Status

### US Strategy (Coinbase):
- ✅ `CoinbaseAdvancedProvider` implemented
- ✅ `GeographicTradingRouter` with US detection
- ✅ Hedge recommendation system
- ⚠️ Mock implementation - needs real API integration
- ⚠️ Requires Coinbase Advanced API account

### Global Strategy (On-Chain):
- ✅ `PerpsAPI` for Vortex/DragonSwap
- ✅ On-chain transaction building
- ⚠️ Protocol contract addresses needed
- ⚠️ Requires testnet/mainnet deployment

---

## Setting Up for US Operations

1. **Create Coinbase Advanced Account**
   - Sign up at [Coinbase Advanced](https://www.coinbase.com/advanced-trade)
   - Complete KYC verification
   - Enable API access

2. **Generate API Credentials**
   - Create API key with trading permissions
   - Store securely (never commit to git)

3. **Configure Environment**
   ```bash
   # .env
   USER_GEOGRAPHY=US
   PERP_PREFERENCE=COINBASE_ONLY
   COINBASE_ADVANCED_API_KEY=your-api-key
   COINBASE_ADVANCED_SECRET=your-api-secret
   COINBASE_ADVANCED_PASSPHRASE=your-passphrase
   COINBASE_SANDBOX=true  # Use true for testing
   ```

4. **Test in Sandbox Mode First**
   - Set `COINBASE_SANDBOX=true`
   - Validate all operations
   - Switch to production when ready

---

## Risks

1. **Smart Contract Risk**: Vault or integrated protocol vulnerabilities
2. **Liquidation Risk**: Delta neutral positions can be liquidated
3. **Impermanent Loss**: AMM positions suffer from IL
4. **Funding Rate Reversal**: Arbitrage positions can become unprofitable
5. **Oracle Manipulation**: Price feed attacks
6. **AI Model Risk**: Suboptimal AI decisions
7. **Regulatory Risk (US)**: CEX regulatory changes could affect Coinbase availability
8. **Counterparty Risk (US)**: Coinbase custodial risk for hedged positions
9. **Geographic Misdetection**: User location incorrectly identified

---

## Conclusion

The 15% APY shown for the Native SEI Vault is **achievable** through the combination of:
1. Funding rate arbitrage (primary yield source)
2. Delta neutral LP strategies
3. AMM fee optimization
4. Lending protocol yields

**Current Status**: The strategies exist in `plugin-sei-yield-delta` but require integration work to:
- Automatically allocate vault deposits to strategies
- Return harvested yield to the vault
- Track and report actual performance

The vault contract provides the custody and share infrastructure, while the Kairos AI agent provides the yield-generating operations. Full integration would require connecting these two layers.
