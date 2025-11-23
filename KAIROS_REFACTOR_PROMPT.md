# Kairos Plugin Refactor: Manual to Automatic Vault Integration

> **Use this prompt to refactor the plugin from chat-based manual trading to automatic vault-integrated yield generation**

---

## 🎯 Refactor Objective

Transform the `plugin-sei-yield-delta` from a **chat-based manual trading interface** to an **automatic yield-generating system** that integrates with deployed SEI Vault contracts.

**Current State**: User types commands → Agent responds → User confirms → Manual execution
**Target State**: Vault deposit detected → Automatic allocation → Continuous yield generation → Auto-harvest

---

## 📊 Current vs Target Architecture

### Current (Manual Chat-Based)
```
User: "execute funding arbitrage for BTC"
  ↓
Agent validates command
  ↓
Agent responds with analysis
  ↓
User: "yes, execute it"
  ↓
Agent manually opens position
  ↓
User: "check my positions"
  ↓
Agent shows current status
```

### Target (Automatic Vault-Integrated)
```
User deposits 10 SEI to vault
  ↓
Plugin detects deposit event
  ↓
Automatic allocation:
  - 4 SEI → Funding arbitrage (auto-execute best opportunity)
  - 3 SEI → Delta neutral LP (auto-open position with hedge)
  - 2 SEI → AMM optimization (auto-deploy to optimal range)
  - 1 SEI → YEI lending (auto-deposit)
  ↓
Every 8 hours: Auto-harvest yields
  ↓
Auto-deposit harvested yield back to vault
  ↓
Share value increases automatically
```

---

## 🔄 Required Changes by Component

### 1. Actions Refactor

#### Current Pattern (Chat-Based)
```typescript
// src/actions/funding-arbitrage.ts (CURRENT)
export const fundingArbitrageAction = {
  name: 'FUNDING_ARBITRAGE',

  validate: async (runtime, message) => {
    const text = message.content?.text?.toLowerCase() || '';
    return text.includes('funding') && text.includes('arbitrage');
  },

  handler: async (runtime, message, state, options, callback) => {
    // 1. Parse user command
    // 2. Ask for confirmation
    // 3. Wait for user response
    // 4. Manually execute if confirmed
    await callback({
      text: "Found opportunity, execute? (yes/no)"
    });
  }
};
```

#### Target Pattern (Automatic)
```typescript
// src/actions/funding-arbitrage.ts (TARGET)
export const fundingArbitrageAction = {
  name: 'FUNDING_ARBITRAGE',

  // Remove validate - no longer chat-triggered
  // Add automatic execution mode

  async execute(runtime: IAgentRuntime, options: {
    allocation: bigint;  // Amount allocated from vault
    vaultAddress: string;
    autoExecute: boolean;
  }): Promise<{
    positionsOpened: ArbitragePosition[];
    capitalUsed: bigint;
    capitalRemaining: bigint;
  }> {
    elizaLogger.log(`[FundingArbitrage] Auto-executing with ${options.allocation} allocation`);

    // 1. Scan for opportunities automatically
    const opportunities = await this.scanOpportunities();

    // 2. Filter opportunities by profitability threshold
    const viableOpportunities = opportunities.filter(
      opp => opp.expectedReturn > 0.10 && // 10% minimum
            opp.confidence > 0.75 &&        // 75% confidence
            opp.requiredCapital <= options.allocation
    );

    // 3. Auto-execute best opportunities until capital depleted
    const positions: ArbitragePosition[] = [];
    let remaining = options.allocation;

    for (const opp of viableOpportunities) {
      if (remaining < opp.requiredCapital) break;

      elizaLogger.log(`[FundingArbitrage] Opening position for ${opp.symbol}...`);

      const position = await this.openArbitragePosition(opp);
      positions.push(position);
      remaining -= BigInt(opp.requiredCapital);

      // Save position to vault state for later harvesting
      await savePositionToVault(runtime, options.vaultAddress, position);
    }

    return {
      positionsOpened: positions,
      capitalUsed: options.allocation - remaining,
      capitalRemaining: remaining
    };
  }
};
```

### 2. Add Vault Manager (NEW)

Create `src/providers/sei-vault-manager.ts`:

```typescript
import { ethers } from 'ethers';
import { IAgentRuntime, Service, elizaLogger } from '@elizaos/core';
import { fundingArbitrageAction } from '../actions/funding-arbitrage';
import { deltaNeutralAction } from '../actions/delta-neutral';
import { ammOptimizeAction } from '../actions/amm-optimize';
import { yeiFinanceAction } from '../actions/yei-finance';

export interface VaultAllocation {
  fundingArbitrage: bigint;  // 40%
  deltaNeutral: bigint;       // 30%
  ammOptimization: bigint;    // 20%
  yeiLending: bigint;         // 10%
}

export class SEIVaultManager extends Service {
  static serviceType = 'sei-vault-manager';

  private provider: ethers.Provider;
  private vaultContract: ethers.Contract;
  private vaultAddress: string;

  async initialize(runtime: IAgentRuntime): Promise<void> {
    elizaLogger.log('[VaultManager] Initializing...');

    // Get vault address from settings
    this.vaultAddress = runtime.getSetting('SEI_VAULT_ADDRESS');
    const rpcUrl = runtime.getSetting('SEI_RPC_URL');

    // Connect to SEI network
    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    // Create vault contract instance
    const VAULT_ABI = [
      'event SEIOptimizedDeposit(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)',
      'event SEIOptimizedWithdraw(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)',
      'function totalAssets() view returns (uint256)',
      'function totalSupply() view returns (uint256)',
    ];

    this.vaultContract = new ethers.Contract(
      this.vaultAddress,
      VAULT_ABI,
      this.provider
    );

    // Start monitoring deposits
    await this.watchDeposits(runtime);

    elizaLogger.log('[VaultManager] Initialized successfully');
  }

  /**
   * Monitor vault for deposit events
   */
  private async watchDeposits(runtime: IAgentRuntime) {
    elizaLogger.log('[VaultManager] Starting deposit monitor...');

    this.vaultContract.on('SEIOptimizedDeposit', async (user, amount, shares, blockTime) => {
      elizaLogger.log(`[VaultManager] 🎉 New deposit detected!`);
      elizaLogger.log(`  User: ${user}`);
      elizaLogger.log(`  Amount: ${ethers.formatEther(amount)} SEI`);
      elizaLogger.log(`  Shares: ${ethers.formatEther(shares)}`);

      // Automatically allocate deposit to strategies
      await this.allocateDeposit(runtime, amount);
    });

    elizaLogger.log('[VaultManager] Deposit monitor active ✓');
  }

  /**
   * Allocate deposit across strategies (40/30/20/10)
   */
  private async allocateDeposit(runtime: IAgentRuntime, amount: bigint) {
    try {
      elizaLogger.log(`[VaultManager] Allocating ${ethers.formatEther(amount)} SEI to strategies...`);

      // Calculate allocations
      const allocations = this.calculateAllocations(amount);

      elizaLogger.log('[VaultManager] Allocation breakdown:');
      elizaLogger.log(`  Funding Arbitrage: ${ethers.formatEther(allocations.fundingArbitrage)} SEI (40%)`);
      elizaLogger.log(`  Delta Neutral: ${ethers.formatEther(allocations.deltaNeutral)} SEI (30%)`);
      elizaLogger.log(`  AMM Optimization: ${ethers.formatEther(allocations.ammOptimization)} SEI (20%)`);
      elizaLogger.log(`  YEI Lending: ${ethers.formatEther(allocations.yeiLending)} SEI (10%)`);

      // Execute all strategies in parallel
      const results = await Promise.allSettled([
        fundingArbitrageAction.execute(runtime, {
          allocation: allocations.fundingArbitrage,
          vaultAddress: this.vaultAddress,
          autoExecute: true
        }),
        deltaNeutralAction.execute(runtime, {
          allocation: allocations.deltaNeutral,
          vaultAddress: this.vaultAddress,
          autoExecute: true
        }),
        ammOptimizeAction.execute(runtime, {
          allocation: allocations.ammOptimization,
          vaultAddress: this.vaultAddress,
          autoExecute: true
        }),
        yeiFinanceAction.execute(runtime, {
          allocation: allocations.yeiLending,
          vaultAddress: this.vaultAddress,
          autoExecute: true
        })
      ]);

      // Log results
      elizaLogger.log('[VaultManager] Allocation complete:');
      results.forEach((result, index) => {
        const strategyNames = ['Funding Arbitrage', 'Delta Neutral', 'AMM Optimization', 'YEI Lending'];
        if (result.status === 'fulfilled') {
          elizaLogger.log(`  ✓ ${strategyNames[index]}: Success`);
        } else {
          elizaLogger.error(`  ✗ ${strategyNames[index]}: Failed - ${result.reason}`);
        }
      });

    } catch (error) {
      elizaLogger.error(`[VaultManager] Allocation failed: ${error}`);
    }
  }

  /**
   * Calculate 40/30/20/10 allocation
   */
  private calculateAllocations(amount: bigint): VaultAllocation {
    return {
      fundingArbitrage: (amount * 40n) / 100n,
      deltaNeutral: (amount * 30n) / 100n,
      ammOptimization: (amount * 20n) / 100n,
      yeiLending: (amount * 10n) / 100n,
    };
  }

  /**
   * Harvest yield from all strategies
   * Called every 8 hours by vault-monitor evaluator
   */
  async harvestYield(runtime: IAgentRuntime): Promise<bigint> {
    elizaLogger.log('[VaultManager] Harvesting yield from all strategies...');

    let totalYield = 0n;

    try {
      // 1. Collect funding rate payments
      const fundingYield = await this.collectFundingPayments(runtime);
      totalYield += fundingYield;
      elizaLogger.log(`  Funding yield: ${ethers.formatEther(fundingYield)} SEI`);

      // 2. Collect LP fees
      const lpYield = await this.collectLPFees(runtime);
      totalYield += lpYield;
      elizaLogger.log(`  LP yield: ${ethers.formatEther(lpYield)} SEI`);

      // 3. Collect lending interest
      const lendingYield = await this.collectLendingInterest(runtime);
      totalYield += lendingYield;
      elizaLogger.log(`  Lending yield: ${ethers.formatEther(lendingYield)} SEI`);

      elizaLogger.log(`[VaultManager] Total harvested: ${ethers.formatEther(totalYield)} SEI`);

      // 4. Deposit yield back to vault
      if (totalYield > 0n) {
        await this.depositYieldToVault(totalYield);
      }

      return totalYield;
    } catch (error) {
      elizaLogger.error(`[VaultManager] Harvest failed: ${error}`);
      return 0n;
    }
  }

  /**
   * Deposit harvested yield back to vault
   */
  private async depositYieldToVault(amount: bigint) {
    elizaLogger.log(`[VaultManager] Depositing ${ethers.formatEther(amount)} yield to vault...`);

    // This requires the vault to have a depositYield() function
    // See KAIROS_INTEGRATION_GUIDE.md for contract modification

    const tx = await this.vaultContract.depositYield({ value: amount });
    await tx.wait();

    elizaLogger.log('[VaultManager] Yield deposited successfully ✓');
  }

  // Implement these harvest methods based on your strategies
  private async collectFundingPayments(runtime: IAgentRuntime): Promise<bigint> {
    // Get all active funding arbitrage positions
    // Close profitable positions
    // Return collected yield
    return 0n; // Placeholder
  }

  private async collectLPFees(runtime: IAgentRuntime): Promise<bigint> {
    // Collect fees from AMM positions
    // Return collected yield
    return 0n; // Placeholder
  }

  private async collectLendingInterest(runtime: IAgentRuntime): Promise<bigint> {
    // Collect interest from YEI Finance
    // Return collected yield
    return 0n; // Placeholder
  }
}
```

### 3. Add Vault Monitor Evaluator (NEW)

Create `src/evaluators/vault-monitor.ts`:

```typescript
import { Evaluator, IAgentRuntime, Memory, State, elizaLogger } from '@elizaos/core';
import { SEIVaultManager } from '../providers/sei-vault-manager';

export const vaultMonitorEvaluator: Evaluator = {
  name: 'VAULT_MONITOR',
  similes: ['MONITOR_VAULT', 'CHECK_VAULT_HEALTH', 'VAULT_STATUS'],
  description: 'Monitors vault health and triggers automatic yield harvesting',

  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Always active - runs on schedule
    return true;
  },

  handler: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    elizaLogger.log('[VaultMonitor] Running health check...');

    const vaultManager = runtime.getService<SEIVaultManager>('sei-vault-manager');

    if (!vaultManager) {
      elizaLogger.error('[VaultMonitor] VaultManager service not found');
      return null;
    }

    try {
      // 1. Check if it's time to harvest (every 8 hours)
      const lastHarvest = await runtime.getMemory({
        roomId: 'vault_system',
        key: 'last_harvest_time'
      });

      const currentTime = Date.now();
      const harvestInterval = 8 * 60 * 60 * 1000; // 8 hours in ms
      const lastHarvestTime = lastHarvest ? parseInt(lastHarvest.content.text) : 0;

      if (currentTime - lastHarvestTime >= harvestInterval) {
        elizaLogger.log('[VaultMonitor] Harvest interval reached, executing harvest...');

        const yieldAmount = await vaultManager.harvestYield(runtime);

        // Save harvest time
        await runtime.addMemory({
          content: { text: currentTime.toString() },
          type: 'system',
          roomId: 'vault_system',
          key: 'last_harvest_time'
        });

        elizaLogger.log(`[VaultMonitor] Harvest complete: ${yieldAmount} collected`);
      } else {
        const timeUntilHarvest = harvestInterval - (currentTime - lastHarvestTime);
        const hoursRemaining = Math.floor(timeUntilHarvest / (60 * 60 * 1000));
        elizaLogger.log(`[VaultMonitor] Next harvest in ${hoursRemaining} hours`);
      }

      // 2. Check vault health metrics
      const health = await this.checkVaultHealth(runtime, vaultManager);

      if (!health.isHealthy) {
        elizaLogger.warn(`[VaultMonitor] ⚠️ Vault health issue: ${health.issue}`);
        // Trigger alerts or corrective actions
      }

      return {
        health,
        nextHarvest: lastHarvestTime + harvestInterval
      };

    } catch (error) {
      elizaLogger.error(`[VaultMonitor] Error: ${error}`);
      return null;
    }
  },

  async checkVaultHealth(runtime: IAgentRuntime, vaultManager: SEIVaultManager) {
    // Implement health checks:
    // - Are all positions healthy?
    // - Are allocations within targets?
    // - Are there any stuck transactions?
    // - Is yield generation on track?

    return {
      isHealthy: true,
      issue: null,
      metrics: {
        totalValueLocked: '0',
        activePositions: 0,
        yieldGeneratedToday: '0'
      }
    };
  }
};
```

### 4. Update Plugin Index

Update `src/index.ts` to register new services and evaluators:

```typescript
import { Plugin } from '@elizaos/core';
import { SEIVaultManager } from './providers/sei-vault-manager';
import { vaultMonitorEvaluator } from './evaluators/vault-monitor';

// Import existing actions (refactored for automatic execution)
import { fundingArbitrageAction } from './actions/funding-arbitrage';
import { deltaNeutralAction } from './actions/delta-neutral';
import { ammOptimizeAction } from './actions/amm-optimize';
import { yeiFinanceAction } from './actions/yei-finance';

export const seiYieldDeltaPlugin: Plugin = {
  name: 'sei-yield-delta',
  description: 'Automatic yield generation for SEI Vault contracts',

  // Services run continuously
  services: [
    SEIVaultManager,  // Monitors deposits and allocates capital
  ],

  // Evaluators run on schedule
  evaluators: [
    vaultMonitorEvaluator,  // Harvests yield every 8 hours
  ],

  // Actions no longer need chat validation - they're called programmatically
  actions: [
    fundingArbitrageAction,
    deltaNeutralAction,
    ammOptimizeAction,
    yeiFinanceAction,
  ],
};

export default seiYieldDeltaPlugin;
```

---

## 🔑 Key Refactor Patterns

### Pattern 1: Remove Chat Validation
```typescript
// REMOVE THIS
validate: async (runtime, message) => {
  const text = message.content?.text?.toLowerCase();
  return text.includes('execute') && text.includes('strategy');
}

// REPLACE WITH
async execute(runtime, options) {
  // Direct programmatic execution
}
```

### Pattern 2: Add Allocation Parameter
```typescript
// OLD (manual)
handler: async (runtime, message, state, options, callback) => {
  // Parse user message for amount
  const amount = extractAmountFromMessage(message);
}

// NEW (automatic)
async execute(runtime, options: { allocation: bigint; vaultAddress: string }) {
  // Receive allocated capital directly
  const { allocation } = options;
}
```

### Pattern 3: Remove User Confirmations
```typescript
// OLD (requires confirmation)
await callback({
  text: "Found opportunity. Execute? (yes/no)"
});
// Wait for user response...

// NEW (auto-execute)
if (opportunity.expectedReturn > threshold && opportunity.confidence > 0.75) {
  await this.executeImmediately(opportunity);
}
```

### Pattern 4: Add Position Tracking
```typescript
// Save position for later harvesting
async savePositionToVault(runtime, vaultAddress, position) {
  await runtime.addMemory({
    content: {
      text: JSON.stringify(position),
      vaultAddress,
      positionId: position.id,
      strategy: 'funding_arbitrage',
      openedAt: Date.now()
    },
    type: 'vault_position',
    roomId: `vault_${vaultAddress}`
  });
}
```

---

## 📝 Environment Variables Update

Add these to `.env`:

```bash
# Vault Integration
SEI_VAULT_ADDRESS=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
SEI_ORACLE_ADDRESS=0xa3437847337d953ed6c9eb130840d04c249973e5
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_PRIVATE_KEY=<ai-agent-private-key>

# Strategy Thresholds (automatic execution)
MIN_FUNDING_RATE=0.10              # 10% minimum annual for arbitrage
MIN_CONFIDENCE=0.75                # 75% confidence required
MAX_POSITION_SIZE=10000            # $10k max per position
HARVEST_INTERVAL_HOURS=8           # Harvest every 8 hours
REBALANCE_THRESHOLD=0.05           # 5% deviation triggers rebalance

# Automatic Execution (NEW)
AUTO_EXECUTE_STRATEGIES=true       # Enable automatic execution
REQUIRE_USER_CONFIRMATION=false    # No user confirmations
ENABLE_CHAT_INTERFACE=false        # Disable chat commands
```

---

## ✅ Refactor Checklist

### Phase 1: Core Infrastructure
- [ ] Create `src/providers/sei-vault-manager.ts`
- [ ] Create `src/evaluators/vault-monitor.ts`
- [ ] Update `src/index.ts` with new services/evaluators
- [ ] Add vault integration environment variables

### Phase 2: Action Refactoring
- [ ] **Funding Arbitrage** (`src/actions/funding-arbitrage.ts`)
  - [ ] Remove `validate` function
  - [ ] Add `execute()` method with allocation parameter
  - [ ] Remove user confirmations
  - [ ] Add automatic position opening
  - [ ] Add position tracking for harvest

- [ ] **Delta Neutral** (`src/actions/delta-neutral.ts`)
  - [ ] Same refactoring as above
  - [ ] Auto-open LP positions with hedge
  - [ ] Track positions for fee collection

- [ ] **AMM Optimization** (`src/actions/amm-optimize.ts`)
  - [ ] Same refactoring as above
  - [ ] Auto-deploy to optimal ranges
  - [ ] Track liquidity positions

- [ ] **YEI Finance** (`src/actions/yei-finance.ts`)
  - [ ] Same refactoring as above
  - [ ] Auto-deposit to lending
  - [ ] Track lending positions

### Phase 3: Yield Harvesting
- [ ] Implement `collectFundingPayments()`
- [ ] Implement `collectLPFees()`
- [ ] Implement `collectLendingInterest()`
- [ ] Implement `depositYieldToVault()`

### Phase 4: Testing
- [ ] Test deposit detection
- [ ] Test automatic allocation (40/30/20/10)
- [ ] Test yield harvesting (8-hour cycle)
- [ ] Test yield deposit to vault
- [ ] Verify share value increases

---

## 🎯 Success Criteria

After refactoring, the plugin should:

✅ **Automatically detect** vault deposits via event monitoring
✅ **Automatically allocate** deposits to strategies (40/30/20/10) without user input
✅ **Automatically execute** trades when opportunities meet thresholds
✅ **Automatically harvest** yield every 8 hours
✅ **Automatically deposit** harvested yield back to vault
✅ **No chat commands required** for normal operation
✅ **Optional chat interface** for status queries only ("show my positions", "vault stats")

---

## 🚀 Quick Start (After Refactor)

```bash
# 1. Update environment
cp .env.example .env
# Add SEI_VAULT_ADDRESS and other required vars

# 2. Build plugin
bun install
bun run build

# 3. Start in automatic mode
elizaos start

# Plugin will now:
# - Monitor vault for deposits ✓
# - Auto-allocate to strategies ✓
# - Harvest yield every 8 hours ✓
# - No user interaction needed ✓
```

---

## 📞 Support

- **Integration Guide**: [KAIROS_INTEGRATION_GUIDE.md](./KAIROS_INTEGRATION_GUIDE.md)
- **Architecture**: [SEI_VAULT_YIELD_ARCHITECTURE.md](./SEI_VAULT_YIELD_ARCHITECTURE.md)
- **Testing**: [KAIROS_TESTING_SCRIPT.sh](./KAIROS_TESTING_SCRIPT.sh)

---

**Goal**: Transform plugin from a manual trading assistant to an autonomous yield-generating engine that works 24/7 without human intervention!
