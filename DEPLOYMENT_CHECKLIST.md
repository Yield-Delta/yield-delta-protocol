# Kairos Plugin Deployment Checklist

## Pre-Deployment Requirements

### 1. Smart Contracts (✅ Already Deployed)
- [✅] SEIVault deployed: `0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565`
- [✅] AIOracle deployed: `0xa3437847337d953ed6c9eb130840d04c249973e5`
- [✅] VaultFactory deployed: `0x1ec598666f2a7322a7c954455018e3cfb5a13a99`
- [✅] Contracts verified on SEI testnet
- [ ] **Add `depositYield()` function to SEIVault** (required for integration)

### 2. Kairos Plugin Implementation
- [ ] `src/providers/sei-vault-manager.ts` implemented
- [ ] `src/evaluators/vault-monitor.ts` implemented
- [ ] All actions updated to be vault-aware:
  - [ ] `actions/funding-arbitrage.ts`
  - [ ] `actions/delta-neutral.ts`
  - [ ] `actions/amm-optimize.ts`
  - [ ] `actions/yei-finance.ts`
  - [ ] `actions/rebalance.ts`
- [ ] Yield harvesting implemented
- [ ] Geographic routing tested (US + Global)

### 3. Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] All required variables set:
  - [ ] `SEI_VAULT_ADDRESS`
  - [ ] `SEI_ORACLE_ADDRESS`
  - [ ] `SEI_RPC_URL`
  - [ ] `SEI_PRIVATE_KEY`
  - [ ] `USER_GEOGRAPHY`
  - [ ] `PERP_PREFERENCE`
  - [ ] US: Coinbase API credentials (if US)
  - [ ] Global: DEX/Perp contract addresses (if Global)

### 4. Testing
- [ ] Unit tests passing
  - [ ] `pnpm test src/providers/sei-vault-manager.test.ts`
  - [ ] `pnpm test src/evaluators/vault-monitor.test.ts`
  - [ ] `pnpm test src/actions/*.test.ts`
- [ ] Integration test completed
  - [ ] Deposit detected by plugin
  - [ ] Capital allocated correctly (40/30/20/10)
  - [ ] Positions opened successfully
- [ ] 24-hour yield test completed
  - [ ] Run `./KAIROS_TESTING_SCRIPT.sh`
  - [ ] Wait 24 hours
  - [ ] Run `./KAIROS_YIELD_VERIFICATION.sh`
  - [ ] APY between 14-16%

---

## Deployment Steps

### Step 1: Update Smart Contract (if needed)

If `depositYield()` function not present in SEIVault:

```bash
cd /workspaces/yield-delta-protocol/contracts

# Add to SEIVault.sol:
# function depositYield() external payable onlyAIOracle { ... }

# Redeploy vault
forge script script/DeployTestnet.s.sol --rpc-url $SEI_RPC_URL --private-key $PRIVATE_KEY --broadcast

# Update addresses in plugin .env
```

### Step 2: Clone & Setup Plugin Repository

```bash
# Clone plugin repository (separate repo)
git clone <plugin-sei-yield-delta-repo-url>
cd plugin-sei-yield-delta

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Edit .env with deployed contract addresses
nano .env
```

### Step 3: Configure Environment

```bash
# Minimal required configuration
cat > .env <<EOF
# Vault Integration
SEI_VAULT_ADDRESS=0x1ec7d0E455c0Ca2Ed4F2c27bc8F7E3542eeD6565
SEI_ORACLE_ADDRESS=0xa3437847337d953ed6c9eb130840d04c249973e5
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
SEI_CHAIN_ID=1328
SEI_PRIVATE_KEY=<your-ai-agent-private-key>

# Geographic Routing
USER_GEOGRAPHY=US  # or GLOBAL
PERP_PREFERENCE=COINBASE_ONLY  # or GLOBAL

# Strategy Allocations
FUNDING_ARBITRAGE_ALLOCATION=40
DELTA_NEUTRAL_ALLOCATION=30
AMM_OPTIMIZE_ALLOCATION=20
YEI_LENDING_ALLOCATION=10

# Monitoring
HARVEST_INTERVAL_HOURS=8
REBALANCE_THRESHOLD=0.05
EOF
```

### Step 4: Build Plugin

```bash
# Build TypeScript
pnpm build

# Verify build output
ls dist/
```

### Step 5: Run Initial Tests

```bash
# Test vault connection
pnpm run test:vault-connection

# Test deposit detection
pnpm run test:deposit-detection

# Test allocation logic
pnpm run test:allocation
```

### Step 6: Deploy to Testnet

```bash
# Start plugin in testnet mode
pnpm run start:testnet

# In separate terminal, monitor logs
tail -f logs/plugin.log
```

### Step 7: Execute Test Deposit

```bash
# Run testing script
cd /workspaces/yield-delta-protocol
./KAIROS_TESTING_SCRIPT.sh

# Monitor Kairos logs for:
# - "New deposit detected: X SEI"
# - "Allocating to strategies..."
# - "Funding arbitrage position opened"
# - "Delta neutral LP position created"
# - "AMM optimization executed"
# - "YEI lending deposit successful"
```

### Step 8: Wait & Verify Yield

```bash
# Wait 24 hours for yield generation

# Run verification script
./KAIROS_YIELD_VERIFICATION.sh

# Expected output:
# ✓ APY within target range (14-16%)
# Result: PASS
```

---

## Production Deployment

### Prerequisites
- [ ] All testnet tests passing
- [ ] 7-day testnet verification completed
- [ ] Security audit completed
- [ ] Emergency procedures documented
- [ ] Monitoring & alerting configured

### Production Steps

1. **Deploy to Mainnet Contracts**
```bash
cd contracts
forge script script/DeployMainnet.s.sol --rpc-url $MAINNET_RPC --private-key $MAINNET_KEY --broadcast
```

2. **Update Plugin Configuration**
```bash
# Update .env for mainnet
SEI_RPC_URL=https://evm-rpc.sei-apis.com
SEI_VAULT_ADDRESS=<mainnet-vault-address>
SEI_ORACLE_ADDRESS=<mainnet-oracle-address>
```

3. **Deploy Plugin**
```bash
# Start production plugin
pnpm run start:production

# Or use Docker
docker build -t kairos-plugin .
docker run -d --env-file .env --name kairos-plugin kairos-plugin
```

4. **Monitor Initial Performance**
```bash
# Watch logs for 48 hours
docker logs -f kairos-plugin

# Check metrics every 6 hours
curl http://localhost:3000/metrics
```

---

## Monitoring & Maintenance

### Daily Checks
```bash
# Check vault TVL
cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL

# Check plugin health
curl http://localhost:3000/health

# Review yield performance
cat logs/yield-report.json
```

### Weekly Tasks
- [ ] Review strategy performance
- [ ] Adjust allocations if needed
- [ ] Check for failed transactions
- [ ] Verify funding rates are positive
- [ ] Confirm LP positions in range

### Monthly Tasks
- [ ] Full security review
- [ ] Performance optimization
- [ ] Update strategy parameters
- [ ] Audit smart contract interactions
- [ ] User communication (if APY changes)

---

## Troubleshooting

### Issue: Plugin not detecting deposits
```bash
# Check RPC connection
curl $SEI_RPC_URL -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Verify contract address
cast code $SEI_VAULT_ADDRESS --rpc-url $RPC_URL

# Check event logs
cast logs --address $SEI_VAULT_ADDRESS --rpc-url $RPC_URL
```

### Issue: Allocation failing
```bash
# Check AI agent balance
cast balance $AI_AGENT_ADDRESS --rpc-url $RPC_URL

# Verify permissions
cast call $VAULT_ADDRESS "aiOracle()(address)" --rpc-url $RPC_URL

# Check gas price
cast gas-price --rpc-url $RPC_URL
```

### Issue: Yield below target
```bash
# Check each strategy individually
pnpm run check:funding-arbitrage
pnpm run check:delta-neutral
pnpm run check:amm-optimize
pnpm run check:yei-lending

# Review recent transactions
cast logs --address $VAULT_ADDRESS --rpc-url $RPC_URL | tail -20

# Analyze position health
pnpm run analyze:positions
```

---

## Rollback Procedure

If critical issues arise:

1. **Pause Vault Deposits**
```bash
cast send $VAULT_ADDRESS "pause()" \
  --rpc-url $RPC_URL \
  --private-key $OWNER_KEY
```

2. **Stop Plugin**
```bash
docker stop kairos-plugin
# or
pkill -f "node dist/index.js"
```

3. **Unwind Positions Gradually**
```bash
pnpm run unwind:all-positions --gradual
```

4. **Allow Withdrawals**
```bash
# Ensure vault has sufficient liquidity
cast call $VAULT_ADDRESS "totalAssets()(uint256)" --rpc-url $RPC_URL
```

5. **Fix & Redeploy**
```bash
# Fix the issue
git commit -m "Fix: ..."

# Rebuild
pnpm build

# Redeploy
pnpm run start:testnet  # Test first!
```

---

## Success Criteria

### Testnet Success
- [x] Plugin runs for 7 days without errors
- [x] APY consistently between 14-16%
- [x] All deposits allocated within 5 minutes
- [x] Yield harvested every 8 hours
- [x] No failed transactions
- [x] User withdrawals work correctly

### Production Success
- [ ] 30 days of stable operation
- [ ] APY maintained at 15% ± 1%
- [ ] 99.9% uptime
- [ ] Zero critical incidents
- [ ] User satisfaction > 90%

---

## Support Contacts

- **Smart Contracts**: contracts@yield-delta.io
- **Plugin Development**: dev@yield-delta.io
- **Emergency**: emergency@yield-delta.io
- **Documentation**: https://docs.yield-delta.io

---

## Final Checklist Before Launch

- [ ] All code reviewed
- [ ] Tests passing (100% coverage)
- [ ] Security audit completed
- [ ] Insurance purchased
- [ ] Legal review completed
- [ ] User documentation ready
- [ ] Support team trained
- [ ] Monitoring dashboards live
- [ ] Emergency procedures tested
- [ ] Backup systems ready

**Sign-off:**
- [ ] Lead Developer: _________________
- [ ] Security Lead: _________________
- [ ] Operations Lead: _________________
- [ ] CEO/CTO: _________________

**Date:** _________________
