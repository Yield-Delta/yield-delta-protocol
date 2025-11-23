# Claude Prompt for Kairos Plugin Repository (plugin-sei-yield-delta)

> **Use this prompt when working in the separate Kairos plugin repository**

---

## Context

You are working on the **plugin-sei-yield-delta** repository, a Kairos AI agent plugin that generates yield for the SEI Vault smart contracts. This plugin is a **separate repository** from the main protocol.

### Background Information

**Smart Contracts (Deployed on SEI Testnet):**
- SEIVault: `0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565` (5 SEI deposited)
- AIOracle: `0xa3437847337d953ed6c9eb130840d04c249973e5`
- VaultFactory: `0x1ec598666f2a7322a7c954455018e3cfb5a13a99`
- Network: SEI Atlantic-2 (Chain ID: 1328)
- RPC: `https://evm-rpc-testnet.sei-apis.com`

**Target Yield:** 15% APY through 5 strategies:
1. Funding Rate Arbitrage (40% allocation → 8.0% APY)
2. Delta Neutral LP Positions (30% allocation → 3.6% APY)
3. AMM Optimization (20% allocation → 2.0% APY)
4. YEI Finance Lending (10% allocation → 0.5% APY)
5. Portfolio Rebalancing (Variable)

**Geographic Routing:**
- US users → Coinbase Advanced (regulated)
- Global users → On-chain perps (Vortex, DragonSwap)

---

## Current Plugin Structure

```
plugin-sei-yield-delta/
├── src/
│   ├── actions/
│   │   ├── funding-arbitrage.ts    # Strategy 1
│   │   ├── delta-neutral.ts        # Strategy 2
│   │   ├── amm-optimize.ts         # Strategy 3
│   │   ├── yei-finance.ts          # Strategy 4
│   │   └── rebalance.ts            # Strategy 5
│   ├── providers/
│   │   ├── geographic-routing.ts   # US/Global router
│   │   ├── coinbase-advanced.ts    # US perps
│   │   ├── perps-api.ts            # Global perps
│   │   └── sei-vault-manager.ts    # ⚠️ TO BE IMPLEMENTED
│   ├── evaluators/
│   │   └── vault-monitor.ts        # ⚠️ TO BE IMPLEMENTED
│   └── index.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Integration Goals

The plugin currently has all yield strategies implemented but **does NOT connect to the deployed vault contracts**. Your goal is to:

1. **Create `sei-vault-manager.ts`** - Monitor vault events and manage allocations
2. **Create `vault-monitor.ts`** - Health checks and trigger rebalancing
3. **Update existing actions** - Make them vault-aware
4. **Implement yield harvesting** - Send profits back to vault
5. **Test end-to-end** - Deposit → Allocate → Harvest → Compound

---

## Task 1: Implement SEI Vault Manager

### File: `src/providers/sei-vault-manager.ts`

Create a class that:
- Connects to deployed SEIVault contract via ethers.js
- Listens for deposit/withdrawal events
- Allocates new deposits to strategies (40/30/20/10 split)
- Harvests yield from all strategies
- Sends harvested yield back to vault

**Key Functions:**
```typescript
export class SEIVaultManager {
  constructor(config: {
    vaultAddress: string;      // 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
    oracleAddress: string;      // 0xa3437847337d953ed6c9eb130840d04c249973e5
    rpcUrl: string;             // https://evm-rpc-testnet.sei-apis.com
    privateKey: string;         // AI agent wallet key
  })

  // Monitor vault for new deposits
  async watchDeposits(): Promise<void>

  // Allocate deposit across strategies (40/30/20/10)
  async allocateDeposit(amount: bigint): Promise<void>

  // Harvest yield from all active positions
  async harvestYield(): Promise<bigint>

  // Send harvested yield to vault
  async depositYieldToVault(amount: bigint): Promise<void>

  // Check if vault needs rebalancing
  async checkHealth(): Promise<VaultHealth>
}
```

**Contract ABIs Needed:**
```typescript
// SEIVault ABI (minimal)
const VAULT_ABI = [
  "event SEIOptimizedDeposit(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)",
  "event SEIOptimizedWithdraw(address indexed user, uint256 amount, uint256 shares, uint256 blockTime)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function depositYield() payable",  // ⚠️ Needs to be added to contract
];

// AIOracle ABI (minimal)
const ORACLE_ABI = [
  "function submitRebalanceRequest(...) returns (bytes32)",
  "function executeRebalanceRequest(bytes32 requestId, string model) returns (bool)",
];
```

---

## Task 2: Implement Vault Monitor Evaluator

### File: `src/evaluators/vault-monitor.ts`

Create an evaluator that runs periodically (every 1 hour) to:
- Check vault health
- Trigger harvesting every 8 hours (funding rate collection)
- Trigger rebalancing if allocations drift >5% from target
- Report performance metrics

**Key Functions:**
```typescript
export const vaultMonitorEvaluator = {
  name: "VAULT_MONITOR",
  similes: ["MONITOR_VAULT", "CHECK_VAULT"],
  validate: async (runtime: IAgentRuntime, message: Memory) => true,

  handler: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    const vaultManager = getVaultManager(runtime);

    // 1. Check health
    const health = await vaultManager.checkHealth();

    // 2. Harvest yield if ready (every 8 hours)
    if (shouldHarvest(health)) {
      const yieldAmount = await vaultManager.harvestYield();
      await vaultManager.depositYieldToVault(yieldAmount);
    }

    // 3. Rebalance if needed (>5% drift)
    if (health.needsRebalance) {
      await executeRebalance(vaultManager);
    }

    // 4. Report metrics
    return health;
  }
};
```

---

## Task 3: Update Existing Actions

Each action needs to be **vault-aware**. Update them to:
- Accept allocated capital amount as parameter
- Track positions for yield harvesting
- Report performance metrics

### Example: Update `funding-arbitrage.ts`

**Before (Current):**
```typescript
export const fundingArbitrageAction = {
  name: "FUNDING_ARBITRAGE",
  handler: async (runtime, message) => {
    // Scans opportunities and executes
    const opportunities = await scanFundingOpportunities();
    await executeTrades(opportunities);
  }
};
```

**After (Vault-Aware):**
```typescript
export const fundingArbitrageAction = {
  name: "FUNDING_ARBITRAGE",
  handler: async (runtime, message, options?: { allocation?: bigint }) => {
    // Get allocation from vault manager
    const allocation = options?.allocation || getDefaultAllocation();

    // Scan opportunities
    const opportunities = await scanFundingOpportunities();

    // Execute with allocated capital
    const positions = [];
    let remaining = allocation;

    for (const opp of opportunities) {
      if (remaining >= opp.requiredCapital) {
        const pos = await executeFundingArbitrage(opp);
        positions.push(pos);
        remaining -= opp.requiredCapital;
      }
    }

    // Save positions for harvesting
    await savePositions(runtime, positions);

    return { positions, capitalUsed: allocation - remaining };
  }
};
```

**Do the same for:**
- `delta-neutral.ts`
- `amm-optimize.ts`
- `yei-finance.ts`
- `rebalance.ts`

---

## Task 4: Implement Yield Harvesting

Create functions to collect yield from all strategies:

```typescript
// In sei-vault-manager.ts
async harvestYield(): Promise<bigint> {
  let totalYield = 0n;

  // 1. Collect funding rate payments (every 8 hours)
  const fundingYield = await this.collectFundingPayments();
  totalYield += fundingYield;

  // 2. Collect LP fees from AMM positions
  const lpYield = await this.collectLPFees();
  totalYield += lpYield;

  // 3. Collect lending interest from YEI Finance
  const lendingYield = await this.collectLendingInterest();
  totalYield += lendingYield;

  // 4. Realize P&L from closed arbitrage positions
  const arbYield = await this.closeArbitragePositions();
  totalYield += arbYield;

  console.log(`Harvested total yield: ${ethers.formatEther(totalYield)} SEI`);

  return totalYield;
}

async depositYieldToVault(amount: bigint): Promise<void> {
  const tx = await this.vaultContract.depositYield({ value: amount });
  await tx.wait();

  console.log(`Deposited ${ethers.formatEther(amount)} yield to vault`);
}
```

---

## Task 5: Environment Configuration

Update `.env.example` with all required variables:

```bash
# ===== VAULT INTEGRATION =====
SEI_VAULT_ADDRESS=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
SEI_ORACLE_ADDRESS=0xa3437847337d953ed6c9eb130840d04c249973e5
SEI_VAULT_FACTORY=0x1ec598666f2a7322a7c954455018e3cfb5a13a99

# ===== SEI NETWORK =====
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_CHAIN_ID=1328
SEI_PRIVATE_KEY=your-ai-agent-private-key-here

# ===== STRATEGY ALLOCATIONS =====
FUNDING_ARBITRAGE_ALLOCATION=40  # 40%
DELTA_NEUTRAL_ALLOCATION=30      # 30%
AMM_OPTIMIZE_ALLOCATION=20       # 20%
YEI_LENDING_ALLOCATION=10        # 10%

# ===== GEOGRAPHIC ROUTING =====
USER_GEOGRAPHY=US  # US, GLOBAL, EU, ASIA
PERP_PREFERENCE=COINBASE_ONLY  # COINBASE_ONLY, GLOBAL, GEOGRAPHIC

# ===== US STRATEGY (Coinbase Advanced) =====
COINBASE_ADVANCED_API_KEY=your-api-key
COINBASE_ADVANCED_SECRET=your-api-secret
COINBASE_ADVANCED_PASSPHRASE=your-passphrase
COINBASE_SANDBOX=true  # Use sandbox for testing

# ===== GLOBAL STRATEGY (On-Chain Perps) =====
VORTEX_CONTRACT_ADDRESS=0x...
DRAGONSWAP_PERP_ADDRESS=0x...

# ===== DEX INTEGRATION =====
DRAGONSWAP_ROUTER=0x...
ASTROPORT_ROUTER=0x...

# ===== YEI FINANCE =====
YEI_LENDING_CONTRACT=0x...

# ===== MONITORING =====
HARVEST_INTERVAL_HOURS=8
REBALANCE_THRESHOLD=0.05  # 5% deviation triggers rebalance
HEALTH_CHECK_INTERVAL_HOURS=1
```

---

## Task 6: Testing

### Unit Tests
Create tests for each component:

```typescript
// tests/sei-vault-manager.test.ts
describe('SEIVaultManager', () => {
  it('should connect to vault contract', async () => {
    const manager = new SEIVaultManager(config);
    const tvl = await manager.getTotalAssets();
    expect(tvl).toBeGreaterThan(0n);
  });

  it('should detect deposit events', async () => {
    const manager = new SEIVaultManager(config);
    const deposits = await manager.watchDeposits();
    expect(deposits).toBeDefined();
  });

  it('should allocate deposits correctly (40/30/20/10)', async () => {
    const allocation = manager.calculateAllocations(100n);
    expect(allocation.fundingArbitrage).toBe(40n);
    expect(allocation.deltaNeutral).toBe(30n);
    expect(allocation.ammOptimization).toBe(20n);
    expect(allocation.yeiLending).toBe(10n);
  });
});
```

### Integration Test
```bash
# Start plugin
pnpm run start:testnet

# In separate terminal, deposit to vault
cast send 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565 \
  "seiOptimizedDeposit(uint256,address)" \
  1000000000000000000 \  # 1 SEI
  $YOUR_ADDRESS \
  --value 1000000000000000000 \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --private-key $YOUR_KEY

# Watch plugin logs for:
# - "New deposit detected: 1 SEI"
# - "Allocating to strategies..."
# - "Funding arbitrage: 0.4 SEI"
# - "Delta neutral: 0.3 SEI"
# - "AMM optimization: 0.2 SEI"
# - "YEI lending: 0.1 SEI"
```

### Yield Verification (24-hour test)
```bash
# Record initial TVL
INITIAL_TVL=$(cast call 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565 "totalAssets()(uint256)" --rpc-url https://evm-rpc-testnet.sei-apis.com)

# Run plugin for 24 hours
pnpm run start:testnet

# After 24 hours, check TVL
FINAL_TVL=$(cast call 0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565 "totalAssets()(uint256)" --rpc-url https://evm-rpc-testnet.sei-apis.com)

# Calculate daily yield
YIELD=$((FINAL_TVL - INITIAL_TVL))
DAILY_APY=$(echo "scale=4; ($YIELD / $INITIAL_TVL) * 365 * 100" | bc)

echo "Daily APY: ${DAILY_APY}%"
# Expected: ~15% (0.041% daily)
```

---

## Key Requirements

1. **Geographic Compliance**: Always respect user geography settings
   - US users MUST use Coinbase Advanced for perps
   - Global users can use on-chain perps

2. **Capital Efficiency**: Ensure all allocated capital is deployed
   - Track unused capital and report it
   - Suggest reallocation if strategies underperform

3. **Risk Management**:
   - Never exceed max position sizes
   - Maintain reserve for withdrawals (5-10%)
   - Emergency shutdown if losses exceed 5%

4. **Transparency**:
   - Log all transactions with tx hashes
   - Report performance metrics hourly
   - Alert on anomalies

5. **Yield Target**: Achieve 15% APY (14-16% acceptable range)

---

## Success Criteria

- [ ] Plugin detects vault deposits within 1 block
- [ ] Deposits allocated within 5 minutes
- [ ] All 5 strategies receive correct allocations (40/30/20/10)
- [ ] Yield harvested every 8 hours automatically
- [ ] Harvested yield deposited to vault correctly
- [ ] Share value increases over time
- [ ] Actual APY within 1% of target (14-16%)
- [ ] No errors or reverts in 24-hour test
- [ ] All transactions confirmed on SEI testnet

---

## Common Issues & Solutions

**Issue**: Deposit event not detected
- **Solution**: Check RPC WebSocket connection, use polling if needed

**Issue**: Insufficient gas for transactions
- **Solution**: Ensure AI agent wallet has >1 SEI for gas

**Issue**: Yield lower than expected
- **Solution**: Check each strategy individually, verify funding rates are positive

**Issue**: Rebalancing fails
- **Solution**: Check AIOracle permissions, verify signature format

**Issue**: Geographic routing incorrect
- **Solution**: Verify `USER_GEOGRAPHY` env var, test router logic

---

## Additional Resources

- **Main Repository**: `/workspaces/yield-delta-protocol`
- **Contract ABIs**: `/workspaces/yield-delta-protocol/contracts/out`
- **Architecture**: `/workspaces/yield-delta-protocol/SEI_VAULT_YIELD_ARCHITECTURE.md`
- **Integration Guide**: `/workspaces/yield-delta-protocol/KAIROS_INTEGRATION_GUIDE.md`
- **Test Summary**: `/workspaces/yield-delta-protocol/VAULT_TESTING_SUMMARY.md`

---

## Example Commands

```bash
# Install dependencies
pnpm install

# Run in dev mode
pnpm run dev

# Run tests
pnpm test

# Run specific test
pnpm test src/providers/sei-vault-manager.test.ts

# Build for production
pnpm build

# Start in production
pnpm start

# Deploy to testnet
pnpm run start:testnet

# Monitor logs
tail -f logs/plugin.log
```

---

## Final Notes

- This plugin operates **off-chain** and communicates with on-chain contracts via RPC
- All private keys must be kept secure (never commit to git)
- Test on SEI testnet before mainnet deployment
- Monitor gas costs and optimize transaction batching
- Implement rate limiting for API calls (Coinbase, DEXes)
- Set up alerting for failures or low yields
- Document all changes in the plugin README

**Goal**: Seamlessly integrate with deployed vault contracts to automatically generate 15% APY for depositors through diversified DeFi strategies.
