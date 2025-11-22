# Plugin Refactor Plan: plugin-sei-yield-delta

## Overview

The `@elizaos/plugin-sei-yield-delta` plugin needs to be refactored from a **manual chat-based trading bot** to a **vault query interface** that allows users to ask questions about their positions, vault performance, and projected returns.

## Current State (Wrong Architecture)

The plugin currently has actions for manual trading via chat:
- `dragonSwapTradeAction` - Manual swaps
- `perpsTradeAction` - Manual perpetual trades
- `deltaNeutralAction` - Manual delta neutral execution
- `fundingArbitrageAction` - Manual arbitrage
- `rebalanceEvaluatorAction` - Manual rebalancing

**Problem**: Users deposit into vaults that automatically execute strategies. They shouldn't need to type "swap 10 SEI for USDC" - the vault does this automatically.

## Target Architecture (Vault Query Interface)

The AI agent should answer questions about:
- Portfolio status and value
- Vault performance (APY, TVL, fees)
- Position details (liquidity, tick ranges)
- Projected returns for deposits
- Yield history and analytics

---

## Smart Contract Interfaces

### IStrategyVault

```solidity
struct VaultInfo {
    string name;
    string strategy;
    address token0;
    address token1;
    uint24 poolFee;
    uint256 totalSupply;
    uint256 totalValueLocked;
    bool isActive;
}

struct Position {
    int24 tickLower;
    int24 tickUpper;
    uint128 liquidity;
    uint256 tokensOwed0;
    uint256 tokensOwed1;
    uint256 feeGrowthInside0LastX128;
    uint256 feeGrowthInside1LastX128;
}

function getVaultInfo() external view returns (VaultInfo memory);
function getCurrentPosition() external view returns (Position memory);
```

### ICustomerVaultDashboard

```solidity
struct CustomerPortfolio {
    address vaultAddress;
    string vaultName;
    uint256 shareBalance;
    uint256 shareValue;
    uint256 totalDeposited;
    uint256 totalWithdrawn;
    uint256 unrealizedGains;
    uint256 depositTimestamp;
    uint256 lockTimeRemaining;
    bool canWithdraw;
}

struct VaultMetrics {
    uint256 totalValueLocked;
    uint256 totalShares;
    uint256 pricePerShare;
    uint256 apy;
    uint256 totalYieldGenerated;
    uint256 managementFeeRate;
    uint256 performanceFeeRate;
    uint256 withdrawalFeeRate;
}

struct YieldHistory {
    uint256 timestamp;
    uint256 totalValue;
    uint256 yieldGenerated;
    uint256 apy;
}

function getCustomerPortfolio(address customer) external view returns (CustomerPortfolio[] memory);
function getVaultMetrics(address vault) external view returns (VaultMetrics memory);
function getYieldHistory(address vault, uint256 fromTimestamp) external view returns (YieldHistory[] memory);
function calculateProjectedReturns(address vault, uint256 depositAmount, uint256 daysHeld) external view returns (uint256 projectedValue, uint256 projectedYield, uint256 managementFees, uint256 withdrawalFees);
function getOptimalDepositRatio(address vault) external view returns (uint256 token0Ratio, uint256 token1Ratio, uint256 currentPrice);
```

---

## Refactor Tasks

### Task 1: Create Vault Provider

**File**: `src/providers/vault-provider.ts`

**Prompt**:
```
Create a VaultProvider class that connects to the Yield Delta vault contracts on SEI blockchain.

Requirements:
1. Initialize with deployed vault addresses (VaultFactory, CustomerDashboard)
2. Implement methods to call all IStrategyVault and ICustomerVaultDashboard functions
3. Cache results with configurable TTL (default 30 seconds)
4. Support mainnet and testnet configurations
5. Handle errors gracefully with proper logging

Deployed Contract Addresses (get from environment):
- VAULT_FACTORY_ADDRESS
- CUSTOMER_DASHBOARD_ADDRESS
- Individual vault addresses from VaultFactory.getAllVaults()

Methods to implement:
- getCustomerPortfolio(address): Promise<CustomerPortfolio[]>
- getVaultMetrics(vaultAddress): Promise<VaultMetrics>
- getVaultInfo(vaultAddress): Promise<VaultInfo>
- getCurrentPosition(vaultAddress): Promise<Position>
- getYieldHistory(vaultAddress, fromTimestamp): Promise<YieldHistory[]>
- calculateProjectedReturns(vaultAddress, amount, days): Promise<ProjectedReturns>
- getOptimalDepositRatio(vaultAddress): Promise<DepositRatio>
- getAllVaults(): Promise<VaultInfo[]>

Use viem for contract interactions. Export as singleton provider for ElizaOS.
```

---

### Task 2: Create Portfolio Query Action

**File**: `src/actions/portfolio-query.ts`

**Prompt**:
```
Create a PORTFOLIO_QUERY action that answers questions about user's vault positions.

Trigger phrases:
- "What's my portfolio?"
- "Show my positions"
- "What's my balance?"
- "How much do I have deposited?"
- "What are my gains?"
- "Can I withdraw?"

Handler logic:
1. Get user's wallet address from WalletProvider
2. Call vaultProvider.getCustomerPortfolio(address)
3. Format response with:
   - Total portfolio value (sum of all shareValue)
   - Per-vault breakdown (name, shares, value, gains, lock status)
   - Total unrealized gains
   - Withdrawal availability

Example response format:
"Your Yield Delta Portfolio:

Total Value: $5,234.56

Positions:
• Delta Neutral Vault: 1,000 shares ($2,100.00) +$100.00 gains ✓ Can withdraw
• Stable Max Vault: 500 shares ($1,534.56) +$34.56 gains ⏳ 2 days lock remaining
• SEI Hypergrowth: 800 shares ($1,600.00) +$200.00 gains ✓ Can withdraw

Total Unrealized Gains: +$334.56"

Include examples for the AI to learn from.
```

---

### Task 3: Create Vault Metrics Action

**File**: `src/actions/vault-metrics.ts`

**Prompt**:
```
Create a VAULT_METRICS action that returns performance data for specific vaults.

Trigger phrases:
- "What's the APY of [vault name]?"
- "Show TVL for Delta Neutral"
- "What are the fees for Stable Max?"
- "How is the SEI Hypergrowth vault performing?"
- "Vault stats for [name]"

Handler logic:
1. Extract vault name from message (fuzzy match against known vaults)
2. Get vault address from VaultFactory or config
3. Call vaultProvider.getVaultMetrics(address)
4. Also call vaultProvider.getVaultInfo(address) for additional context
5. Format response with key metrics

Vault name mapping (fuzzy match these):
- "delta neutral" / "delta-neutral" / "dn" → DeltaNeutralVault
- "stable max" / "stablemax" / "stable" → StableMaxVault
- "sei hypergrowth" / "hypergrowth" / "sei growth" → SeiHypergrowthVault
- "blue chip" / "bluechip" → BlueChipVault
- "hedge" / "hedging" → HedgeVault
- "yield farming" / "farming" → YieldFarmingVault
- "arbitrage" / "arb" → ArbitrageVault
- "concentrated liquidity" / "cl" / "concentrated" → ConcentratedLiquidityVault

Example response:
"Delta Neutral Vault Metrics:

📊 Performance:
• APY: 12.5%
• Total Yield Generated: $45,230

💰 TVL & Shares:
• Total Value Locked: $1,234,567
• Total Shares: 50,000
• Price per Share: $24.69

💸 Fees:
• Management: 0.5%
• Performance: 10%
• Withdrawal: 0.1%

Strategy: Delta-neutral yield farming with IL protection"
```

---

### Task 4: Create Yield History Action

**File**: `src/actions/yield-history.ts`

**Prompt**:
```
Create a YIELD_HISTORY action that shows historical performance of vaults.

Trigger phrases:
- "Show yield history for [vault]"
- "How has [vault] performed?"
- "Historical returns for Delta Neutral"
- "Past performance of [vault]"
- "Chart for [vault]" (return text-based representation)

Handler logic:
1. Extract vault name and optional time range (default: 30 days)
2. Call vaultProvider.getYieldHistory(address, fromTimestamp)
3. Calculate summary statistics (avg APY, total yield, trend)
4. Format as readable history

Example response:
"Delta Neutral Vault - 30 Day Performance:

📈 Summary:
• Average APY: 11.8%
• Total Yield: $12,450
• Trend: ↗️ Improving

Recent History:
• Nov 22: APY 12.5%, Value $1.23M, Yield $420
• Nov 21: APY 12.3%, Value $1.22M, Yield $415
• Nov 20: APY 11.9%, Value $1.21M, Yield $398
• Nov 19: APY 11.2%, Value $1.20M, Yield $372
...

The vault has shown consistent growth with improving yields over the past week."
```

---

### Task 5: Create Projected Returns Action

**File**: `src/actions/projected-returns.ts`

**Prompt**:
```
Create a PROJECTED_RETURNS action that calculates expected returns for deposits.

Trigger phrases:
- "What would I earn depositing [amount] into [vault]?"
- "Calculate returns for [amount] SEI in [vault] for [days] days"
- "Project my returns"
- "How much would I make with [amount]?"
- "Estimate yield for [amount] in [vault]"

Handler logic:
1. Extract: amount, vault name, and holding period (default: 30 days)
2. Call vaultProvider.calculateProjectedReturns(address, amount, days)
3. Also get current vault metrics for context
4. Format projection with fee breakdown

Example response:
"Projected Returns for 1,000 SEI in Delta Neutral Vault (30 days):

💰 Deposit: 1,000 SEI ($450.00)

📊 Projections (based on current 12.5% APY):
• Projected Value: $454.62
• Gross Yield: $4.62
• Management Fees: -$0.19
• Net Yield: $4.43

📤 On Withdrawal:
• Withdrawal Fee: -$0.45
• Final Value: $454.17

⚠️ Note: Projections based on current APY. Actual returns may vary based on market conditions."
```

---

### Task 6: Create Vault List Action

**File**: `src/actions/vault-list.ts`

**Prompt**:
```
Create a VAULT_LIST action that shows all available vaults with key info.

Trigger phrases:
- "What vaults are available?"
- "Show all vaults"
- "List vaults"
- "Which strategies can I invest in?"
- "What are my options?"

Handler logic:
1. Call vaultProvider.getAllVaults()
2. For each vault, get basic metrics (APY, TVL)
3. Format as a comparison list

Example response:
"Available Yield Delta Vaults:

🔵 Delta Neutral Vault
   APY: 12.5% | TVL: $1.23M | Risk: Low
   Strategy: Delta-neutral yield with IL protection

🟢 Stable Max Vault
   APY: 8.2% | TVL: $890K | Risk: Very Low
   Strategy: Stablecoin optimization

🟡 SEI Hypergrowth Vault
   APY: 24.8% | TVL: $456K | Risk: High
   Strategy: Leveraged SEI exposure

🔵 Blue Chip Vault
   APY: 15.3% | TVL: $2.1M | Risk: Medium
   Strategy: BTC/ETH diversified yield

🟠 Hedge Vault
   APY: 10.1% | TVL: $678K | Risk: Low
   Strategy: Hedged positions with downside protection

🟢 Yield Farming Vault
   APY: 18.7% | TVL: $345K | Risk: Medium
   Strategy: Optimized LP farming

🟡 Arbitrage Vault
   APY: 22.4% | TVL: $234K | Risk: Medium-High
   Strategy: Cross-DEX arbitrage

🔵 Concentrated Liquidity Vault
   APY: 16.9% | TVL: $567K | Risk: Medium
   Strategy: Active CL position management

Use 'vault metrics [name]' for detailed info on any vault."
```

---

### Task 7: Create Position Details Action

**File**: `src/actions/position-details.ts`

**Prompt**:
```
Create a POSITION_DETAILS action that shows current vault position details (for advanced users).

Trigger phrases:
- "Show position for [vault]"
- "What's the current tick range?"
- "Liquidity details for [vault]"
- "Position info"
- "Show LP position"

Handler logic:
1. Extract vault name
2. Call vaultProvider.getCurrentPosition(address)
3. Call vaultProvider.getVaultInfo(address) for token info
4. Format technical position details

Example response:
"Delta Neutral Vault - Current Position:

📍 Tick Range:
• Lower: -887220 (price: $0.38)
• Upper: -886380 (price: $0.52)
• Current: -886800 (price: $0.45)

💧 Liquidity:
• Total Liquidity: 1,234,567,890
• Token0 (SEI): 50,000
• Token1 (USDC): 22,500

💰 Uncollected Fees:
• SEI: 125.5
• USDC: 56.2

Position is 65% in range. Rebalance expected when price moves outside ±5% of current range."
```

---

### Task 8: Create Optimal Deposit Action

**File**: `src/actions/optimal-deposit.ts`

**Prompt**:
```
Create an OPTIMAL_DEPOSIT action that helps users deposit with optimal token ratios.

Trigger phrases:
- "What's the optimal deposit ratio for [vault]?"
- "How should I deposit into [vault]?"
- "Best ratio for [vault]"
- "Deposit recommendation for [vault]"

Handler logic:
1. Extract vault name
2. Call vaultProvider.getOptimalDepositRatio(address)
3. Also get current price for context
4. Format recommendation

Example response:
"Optimal Deposit for Delta Neutral Vault:

📊 Current Optimal Ratio:
• Token0 (SEI): 55%
• Token1 (USDC): 45%

💱 Current Price: 1 SEI = $0.45 USDC

💡 Example Deposits:
• For $1,000: 1,222 SEI + 450 USDC
• For $5,000: 6,111 SEI + 2,250 USDC

Depositing at the optimal ratio maximizes your LP position efficiency and minimizes unused tokens."
```

---

### Task 9: Update Plugin Index

**File**: `src/index.ts`

**Prompt**:
```
Update the main plugin index to export the new vault-focused actions and remove/deprecate the manual trading actions.

Changes:
1. Import new actions:
   - portfolioQueryAction
   - vaultMetricsAction
   - yieldHistoryAction
   - projectedReturnsAction
   - vaultListAction
   - positionDetailsAction
   - optimalDepositAction

2. Import new provider:
   - vaultProvider

3. Keep these existing actions:
   - priceQueryAction (already working)
   - transferAction (for basic transfers)

4. Remove or mark deprecated:
   - dragonSwapTradeAction
   - fundingArbitrageAction
   - perpsTradeAction
   - rebalanceEvaluatorAction
   - ilProtectionAction
   - ammOptimizeAction
   - deltaNeutralAction

5. Update plugin description to reflect vault query focus

6. Export new types for vault data structures
```

---

### Task 10: Add Environment Configuration

**File**: `src/environment.ts`

**Prompt**:
```
Update the environment configuration to include vault contract addresses.

Add new environment variables:
- VAULT_FACTORY_ADDRESS - VaultFactory contract
- CUSTOMER_DASHBOARD_ADDRESS - CustomerVaultDashboard contract
- DELTA_NEUTRAL_VAULT_ADDRESS
- STABLE_MAX_VAULT_ADDRESS
- SEI_HYPERGROWTH_VAULT_ADDRESS
- BLUE_CHIP_VAULT_ADDRESS
- HEDGE_VAULT_ADDRESS
- YIELD_FARMING_VAULT_ADDRESS
- ARBITRAGE_VAULT_ADDRESS
- CONCENTRATED_LIQUIDITY_VAULT_ADDRESS

Add validation for required vault addresses.
Add helper function to get vault address by name.
Support both mainnet and testnet addresses.
```

---

### Task 11: Add Vault Types

**File**: `src/types/vault.ts`

**Prompt**:
```
Create TypeScript types matching the Solidity structs for vault data.

Types to create:
- VaultInfo
- Position
- CustomerPortfolio
- VaultMetrics
- YieldHistory
- ProjectedReturns
- DepositRatio
- AIRebalanceParams

Also create:
- VaultName enum with all vault names
- VaultAddress mapping type
- Helper type guards for validation
```

---

## Testing Tasks

### Task 12: Unit Tests for Vault Provider

**Prompt**:
```
Create unit tests for the VaultProvider class.

Test coverage:
- Contract call mocking
- Cache behavior
- Error handling
- Data transformation
- Network switching (mainnet/testnet)

Use vitest and mock viem contract calls.
```

### Task 13: Integration Tests for Actions

**Prompt**:
```
Create integration tests for all new vault query actions.

Test each action with:
- Various trigger phrases
- Different vault names (including fuzzy matching)
- Edge cases (no positions, invalid vault names)
- Response format validation

Mock the VaultProvider responses.
```

---

## Migration Notes

### For Existing Users

The following actions are being deprecated:
- Manual swap execution → Use the frontend or deposit into vaults
- Manual perp trading → Vaults handle this automatically
- Manual rebalancing → AI keeper handles this automatically

### New Capabilities

Users can now ask:
- "What's my portfolio value?"
- "Show me all vaults and their APYs"
- "How much would I earn with 1000 SEI in Delta Neutral for 30 days?"
- "What's the yield history for Stable Max vault?"
- "What's the optimal deposit ratio?"

---

## Deployment Checklist

- [ ] Deploy VaultFactory contract and get address
- [ ] Deploy CustomerVaultDashboard contract and get address
- [ ] Deploy all strategy vaults and get addresses
- [ ] Update .env with all contract addresses
- [ ] Build and test plugin locally
- [ ] Publish updated plugin package
- [ ] Update documentation

---

## Contract Addresses (To Be Filled)

### Mainnet
```
VAULT_FACTORY_ADDRESS=
CUSTOMER_DASHBOARD_ADDRESS=
DELTA_NEUTRAL_VAULT_ADDRESS=
STABLE_MAX_VAULT_ADDRESS=
SEI_HYPERGROWTH_VAULT_ADDRESS=
BLUE_CHIP_VAULT_ADDRESS=
HEDGE_VAULT_ADDRESS=
YIELD_FARMING_VAULT_ADDRESS=
ARBITRAGE_VAULT_ADDRESS=
CONCENTRATED_LIQUIDITY_VAULT_ADDRESS=
```

### Testnet
```
VAULT_FACTORY_ADDRESS=
CUSTOMER_DASHBOARD_ADDRESS=
...
```
