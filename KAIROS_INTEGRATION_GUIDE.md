# Kairos AI Agent Integration Guide

## Overview

This document outlines the integration between the SEI Vault smart contracts and the Kairos AI agent (`plugin-sei-yield-delta`). The plugin is a **separate repository** that needs to communicate with deployed vault contracts to generate yield.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SEI Blockchain                           │
│  ┌───────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  SEIVault.sol │  │ AIOracle.sol │  │ VaultFactory    │  │
│  │  (Custody)    │←─┤  (AI Bridge) │  │                 │  │
│  └───────────────┘  └──────────────┘  └─────────────────┘  │
│         ↕                   ↕                                │
└─────────────────────────────────────────────────────────────┘
                         ↕
              (RPC Calls & Transactions)
                         ↕
┌─────────────────────────────────────────────────────────────┐
│              Kairos AI Agent (Off-Chain)                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         plugin-sei-yield-delta                       │   │
│  │  ├── actions/                                        │   │
│  │  │   ├── funding-arbitrage.ts  (Funding Rate Arb)  │   │
│  │  │   ├── delta-neutral.ts      (LP + Perp Hedge)   │   │
│  │  │   ├── amm-optimize.ts       (Concentrated Liq)  │   │
│  │  │   ├── yei-finance.ts        (Lending)           │   │
│  │  │   └── rebalance.ts          (Portfolio Mgmt)    │   │
│  │  ├── providers/                                      │   │
│  │  │   ├── sei-vault-manager.ts  (Vault Integration)  │   │
│  │  │   ├── geographic-routing.ts (US/Global Router)   │   │
│  │  │   ├── coinbase-advanced.ts  (US Perps)          │   │
│  │  │   └── perps-api.ts          (Global Perps)      │   │
│  │  └── evaluators/                                     │   │
│  │      └── vault-monitor.ts      (Health Check)       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Integration Status

### ✅ What Exists
- **Smart Contracts**: Deployed on SEI testnet
  - SEIVault: `0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565` (5 SEI)
  - AIOracle: `0xa3437847337d953ed6c9eb130840d04c249973e5`
  - VaultFactory: `0x1ec598666f2a7322a7c954455018e3cfb5a13a99`

- **Kairos Plugin**: Implemented but not connected
  - All 5 yield strategies implemented
  - Geographic routing (US/Global) ready
  - Provider interfaces defined

### ❌ What's Missing (Integration Layer)

The plugin doesn't yet:
1. Monitor vault deposits/withdrawals
2. Automatically allocate deposited funds to strategies
3. Harvest yield back to vault
4. Track actual performance vs expected

---

## Integration Architecture

### Phase 1: Vault Monitoring
The plugin needs to watch vault events and maintain state:

```typescript
// New file: providers/sei-vault-manager.ts
interface VaultState {
  address: string;
  totalAssets: bigint;
  totalShares: bigint;
  allocations: {
    fundingArbitrage: bigint;
    deltaNeutral: bigint;
    ammOptimization: bigint;
    yeiLending: bigint;
    reserve: bigint;
  };
  lastRebalance: number;
}
```

### Phase 2: Deposit Allocation
When user deposits, plugin allocates to strategies:

```typescript
// On vault deposit event
async function onVaultDeposit(vaultAddress: string, amount: bigint) {
  const allocations = calculateOptimalAllocation(amount);

  // 40% to funding arbitrage
  await openFundingPositions(allocations.fundingArbitrage);

  // 30% to delta neutral LP
  await provideLiquidityWithHedge(allocations.deltaNeutral);

  // 20% to AMM optimization
  await optimizeAMMPositions(allocations.ammOptimization);

  // 10% to YEI lending
  await depositToYEI(allocations.yeiLending);
}
```

### Phase 3: Yield Harvesting
Periodically harvest yields and compound:

```typescript
// Run every 8 hours (funding rate collection)
async function harvestYield(vaultAddress: string) {
  // Collect funding payments
  const fundingYield = await collectFundingPayments();

  // Collect LP fees
  const lpYield = await collectLPFees();

  // Collect lending interest
  const lendingYield = await collectLendingInterest();

  // Send to vault (increases totalAssets)
  await sendYieldToVault(vaultAddress, totalYield);
}
```

---

## Required Contract Modifications

### 1. Add Yield Deposit Function to SEIVault

```solidity
// Add to SEIVault.sol
/**
 * @dev Allow AI oracle to deposit harvested yield
 * This increases totalAssets without minting shares
 */
function depositYield() external payable onlyAIOracle {
    require(msg.value > 0, "No yield to deposit");

    // Update vault info
    vaultInfo.totalValueLocked = _getTotalAssetBalance();

    emit YieldHarvested(msg.sender, msg.value, block.timestamp);
}

event YieldHarvested(address indexed harvester, uint256 amount, uint256 timestamp);
```

### 2. Add Allocation Request to AIOracle

```solidity
// Add to AIOracle.sol
struct AllocationRequest {
    address vault;
    uint256 amount;
    uint256[] strategyAllocations; // [40%, 30%, 20%, 10%]
    uint256 timestamp;
}

event AllocationRequested(address indexed vault, uint256 amount);

function requestAllocation(address vault, uint256 amount) external {
    emit AllocationRequested(vault, amount);
}
```

---

## Plugin Implementation Tasks

### Task 1: Create Vault Manager
**File**: `kairos/plugin-sei-yield-delta/src/providers/sei-vault-manager.ts`

```typescript
import { ethers } from 'ethers';
import { ElizaOS } from '@elizaos/core';

export class SEIVaultManager {
  private provider: ethers.Provider;
  private vaultContract: ethers.Contract;
  private oracleContract: ethers.Contract;

  constructor(config: {
    vaultAddress: string;
    oracleAddress: string;
    rpcUrl: string;
    privateKey: string;
  }) {
    // Initialize contracts
  }

  /**
   * Monitor vault for deposit events
   */
  async watchDeposits() {
    this.vaultContract.on('SEIOptimizedDeposit', async (user, amount, shares, blockTime) => {
      console.log(`New deposit: ${amount} from ${user}`);
      await this.allocateDeposit(amount);
    });
  }

  /**
   * Allocate new deposits to strategies
   */
  async allocateDeposit(amount: bigint) {
    const allocations = this.calculateAllocations(amount);

    // Execute allocations in parallel
    await Promise.all([
      this.fundingArbitrageAction.execute(allocations.fundingArbitrage),
      this.deltaNeutralAction.execute(allocations.deltaNeutral),
      this.ammOptimizeAction.execute(allocations.ammOptimization),
      this.yeiFinanceAction.execute(allocations.yeiLending),
    ]);
  }

  /**
   * Harvest yield from all strategies
   */
  async harvestYield() {
    const yields = await this.collectAllYields();
    const totalYield = yields.reduce((a, b) => a + b, 0n);

    if (totalYield > 0n) {
      await this.depositYieldToVault(totalYield);
    }
  }

  /**
   * Calculate optimal allocations (40/30/20/10)
   */
  private calculateAllocations(amount: bigint) {
    return {
      fundingArbitrage: (amount * 40n) / 100n,
      deltaNeutral: (amount * 30n) / 100n,
      ammOptimization: (amount * 20n) / 100n,
      yeiLending: (amount * 10n) / 100n,
    };
  }

  /**
   * Deposit harvested yield to vault
   */
  private async depositYieldToVault(amount: bigint) {
    const tx = await this.vaultContract.depositYield({ value: amount });
    await tx.wait();
    console.log(`Deposited ${amount} yield to vault`);
  }
}
```

### Task 2: Create Vault Monitor Evaluator
**File**: `kairos/plugin-sei-yield-delta/src/evaluators/vault-monitor.ts`

```typescript
import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import { SEIVaultManager } from "../providers/sei-vault-manager";

export const vaultMonitorEvaluator = {
  name: "VAULT_MONITOR",
  similes: ["MONITOR_VAULT", "CHECK_VAULT_HEALTH"],
  description: "Monitors vault health and triggers rebalancing when needed",

  async handler(runtime: IAgentRuntime, message: Memory, state?: State) {
    const vaultManager = new SEIVaultManager({
      vaultAddress: runtime.getSetting("SEI_VAULT_ADDRESS"),
      oracleAddress: runtime.getSetting("SEI_ORACLE_ADDRESS"),
      rpcUrl: runtime.getSetting("SEI_RPC_URL"),
      privateKey: runtime.getSetting("SEI_PRIVATE_KEY"),
    });

    // Check vault health
    const health = await vaultManager.checkHealth();

    // Trigger actions if needed
    if (health.needsRebalance) {
      await vaultManager.rebalance();
    }

    if (health.readyToHarvest) {
      await vaultManager.harvestYield();
    }

    return health;
  }
};
```

### Task 3: Update Actions to Work with Vault

Each action needs to be aware of vault state:

```typescript
// Example: Update funding-arbitrage.ts
export const fundingArbitrageAction = {
  name: "FUNDING_ARBITRAGE",

  async handler(runtime: IAgentRuntime, message: Memory) {
    // Get allocated amount from vault manager
    const allocation = await getVaultAllocation("fundingArbitrage");

    // Find opportunities
    const opportunities = await scanFundingOpportunities();

    // Execute trades with allocated capital
    for (const opp of opportunities) {
      if (allocation >= opp.requiredCapital) {
        await executeFundingArbitrage(opp);
        allocation -= opp.requiredCapital;
      }
    }

    // Track positions for yield harvesting
    await savePositions(positions);
  }
};
```

---

## Environment Configuration

### Required Environment Variables
```bash
# Vault Integration
SEI_VAULT_ADDRESS=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
SEI_ORACLE_ADDRESS=0xa3437847337d953ed6c9eb130840d04c249973e5
SEI_VAULT_FACTORY=0x1ec598666f2a7322a7c954455018e3cfb5a13a99

# SEI Network
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_CHAIN_ID=1328
SEI_PRIVATE_KEY=your-ai-agent-private-key

# Geographic Routing
USER_GEOGRAPHY=US  # or GLOBAL, EU, ASIA
PERP_PREFERENCE=COINBASE_ONLY  # or GLOBAL, GEOGRAPHIC

# US Strategy (Coinbase)
COINBASE_ADVANCED_API_KEY=your-key
COINBASE_ADVANCED_SECRET=your-secret
COINBASE_ADVANCED_PASSPHRASE=your-passphrase
COINBASE_SANDBOX=true

# Global Strategy (On-Chain Perps)
VORTEX_CONTRACT_ADDRESS=0x...
DRAGONSWAP_PERP_ADDRESS=0x...

# YEI Finance
YEI_LENDING_CONTRACT=0x...

# DEX Routers (for LP)
DRAGONSWAP_ROUTER=0x...
ASTROPORT_ROUTER=0x...

# Monitoring
HARVEST_INTERVAL_HOURS=8
REBALANCE_THRESHOLD=0.05  # 5% deviation triggers rebalance
```

---

## Testing Plan

### Phase 1: Unit Tests
Test each component independently:

```bash
cd kairos/plugin-sei-yield-delta

# Test vault manager
pnpm test src/providers/sei-vault-manager.test.ts

# Test individual strategies
pnpm test src/actions/funding-arbitrage.test.ts
pnpm test src/actions/delta-neutral.test.ts
pnpm test src/actions/amm-optimize.test.ts
pnpm test src/actions/yei-finance.test.ts

# Test evaluators
pnpm test src/evaluators/vault-monitor.test.ts
```

### Phase 2: Integration Tests
Test plugin → vault communication:

```bash
# Start plugin in test mode
pnpm run start:testnet

# Deposit to vault via frontend
# Watch plugin logs for:
# - Deposit detection
# - Allocation execution
# - Position opening
# - Yield harvesting
```

### Phase 3: Yield Verification
Verify actual yield matches expected:

```bash
# Run for 24 hours
pnpm run start:testnet

# Check vault TVL increase
cast call 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565 "totalAssets()(uint256)" --rpc-url https://evm-rpc-testnet.sei-apis.com

# Should show growth from:
# - Funding rate collections
# - LP fees
# - Lending interest
```

---

## Deployment Checklist

### Pre-Deployment
- [ ] All contracts deployed and verified
- [ ] Plugin environment variables configured
- [ ] Geographic routing tested (US + Global)
- [ ] Yield strategies individually tested
- [ ] Vault manager integration tested
- [ ] Harvest mechanism tested
- [ ] Performance tracking implemented

### Testnet Deployment
- [ ] Deploy to SEI Atlantic-2 testnet
- [ ] Configure plugin with testnet addresses
- [ ] Test deposit → allocation → harvest cycle
- [ ] Verify yield generation over 7 days
- [ ] Check share value appreciation
- [ ] Test withdrawal functionality

### Mainnet Deployment
- [ ] Security audit completed
- [ ] All tests passing
- [ ] Monitoring/alerting configured
- [ ] Emergency pause mechanisms tested
- [ ] Documentation complete
- [ ] User guides prepared

---

## Monitoring & Operations

### Key Metrics to Track
```typescript
interface VaultMetrics {
  tvl: bigint;
  sharePrice: number;
  actualAPY: number;
  targetAPY: number;
  deviation: number;

  strategyAllocations: {
    fundingArbitrage: { amount: bigint; apy: number };
    deltaNeutral: { amount: bigint; apy: number };
    ammOptimization: { amount: bigint; apy: number };
    yeiLending: { amount: bigint; apy: number };
  };

  positionHealth: {
    openPositions: number;
    totalValue: bigint;
    unrealizedPnL: bigint;
  };
}
```

### Dashboard Queries
```bash
# Current vault TVL
cast call $VAULT "totalAssets()(uint256)" --rpc-url $RPC

# Current share price
cast call $VAULT "totalSupply()(uint256)" --rpc-url $RPC

# Oracle stats
cast call $ORACLE "totalRequests()(uint256)" --rpc-url $RPC
cast call $ORACLE "successfulRequests()(uint256)" --rpc-url $RPC
```

---

## Emergency Procedures

### If Yield is Below Target
1. Check each strategy individually
2. Verify funding rates are positive
3. Confirm LP positions are in range
4. Check lending protocol rates
5. Increase allocation to best-performing strategy

### If Smart Contract Issues
1. Pause vault deposits (owner function)
2. Stop plugin operations
3. Unwind positions gradually
4. Allow withdrawals to continue
5. Fix issue and redeploy

### If Geographic Routing Fails
- US: Fallback to on-chain perps (if legally compliant)
- Global: Fallback to different DEX
- Notify users of strategy changes

---

## Next Steps

1. **Immediate**: Implement `sei-vault-manager.ts`
2. **Week 1**: Add deposit monitoring and allocation
3. **Week 2**: Implement yield harvesting
4. **Week 3**: Full integration testing on testnet
5. **Week 4**: 7-day yield verification
6. **Week 5**: Security audit
7. **Week 6**: Mainnet deployment

---

## Support & Resources

- **Smart Contracts**: `/workspaces/yield-delta-protocol/contracts`
- **Plugin Code**: `/workspaces/yield-delta-protocol/kairos`
- **Architecture Doc**: `/workspaces/yield-delta-protocol/SEI_VAULT_YIELD_ARCHITECTURE.md`
- **Test Results**: `/workspaces/yield-delta-protocol/VAULT_TESTING_SUMMARY.md`

For questions or issues, refer to the main repository documentation.
