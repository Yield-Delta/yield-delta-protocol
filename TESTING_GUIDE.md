# SEI Vault Testing Guide

Complete testing guide for SEI Vault on Atlantic-2 Testnet.

## Deployed Contracts (Nov 23, 2025)

- **AI Oracle:** `0xA3437847337d953ED6c9eB130840D04c249973e5`
- **Vault Factory:** `0x1ec598666F2A7322A7C954455018e3CFB5A13A99`
- **SEI Vault:** `0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0`
- **AI Model:** `liquidity-optimizer-v1.0` (Signer: `0x5221d1538f29977e7BbB3A5fAd8252B982ae208a`)

## Prerequisites

1. **SEI Testnet Tokens**: Get testnet SEI from the [SEI faucet](https://atlantic-2.app.sei.io/faucet)
2. **MetaMask/Wallet**: Connected to SEI Atlantic-2 Testnet
   - Network Name: SEI Atlantic-2 Testnet
   - RPC URL: https://evm-rpc-testnet.sei-apis.com
   - Chain ID: 1328
   - Currency: SEI
   - Explorer: https://seitrace.com/atlantic-2

## Quick Test Suite

### 1. Run Comprehensive Vault Status Check

```bash
cd /workspaces/yield-delta-protocol/backend-signer
./scripts/testVault.sh
```

This checks:
- ✅ Vault configuration
- ✅ TVL and supply metrics
- ✅ Fee structure
- ✅ SEI optimizations
- ✅ AI Oracle connection
- ✅ Position status

### 2. Test Deposit

**Option A: Using the frontend**
1. Start frontend: `cd yield-delta-frontend && npm run dev`
2. Connect wallet
3. Navigate to deposit page
4. Enter amount and confirm

**Option B: Using CLI script**
```bash
cd backend-signer
./scripts/testDeposit.sh 1.0 <YOUR_ADDRESS> <YOUR_PRIVATE_KEY>
```

**Option C: Using cast directly**
```bash
cast send 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 \
  "seiOptimizedDeposit(uint256,address)" \
  1000000000000000000 \
  <YOUR_ADDRESS> \
  --value 1000000000000000000 \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --private-key <YOUR_PRIVATE_KEY>
```

**Expected Results:**
- Transaction succeeds
- Vault shares minted (1:1 ratio for first deposit)
- `SEIOptimizedDeposit` event emitted
- Balance updates in vault

### 3. Test Withdrawal

**Option A: Using CLI script**
```bash
cd backend-signer
./scripts/testWithdraw.sh 0.5 <YOUR_ADDRESS> <YOUR_PRIVATE_KEY>
```

**Option B: Using cast directly**
```bash
cast send 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 \
  "withdraw(uint256,address,address)(uint256)" \
  500000000000000000 \
  <YOUR_ADDRESS> \
  <YOUR_ADDRESS> \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --private-key <YOUR_PRIVATE_KEY>
```

**Expected Results:**
- Transaction succeeds
- Vault shares burned
- SEI returned to user
- `SEIOptimizedWithdraw` event emitted

### 4. Test AI Rebalancing

**Start the backend signer service:**
```bash
cd backend-signer
npm run dev
```

**What it does:**
- Monitors vault state every 5 minutes (configurable)
- Fetches AI recommendations from AI engine
- Submits rebalance requests to AIOracle
- Executes approved rebalances automatically

**Expected logs:**
```
[info]: Starting rebalance check cycle
[info]: Processing 1 vaults
[info]: Received rebalance recommendation
[info]: Submitting rebalance request to AIOracle
[info]: Transaction submitted, waiting for confirmation...
[info]: Rebalance request submitted successfully
[info]: Executing rebalance request
[info]: Execution transaction submitted
[info]: Rebalance request executed
```

### 5. Manual Rebalance Test (Advanced)

```bash
# Submit rebalance request
cast send 0xA3437847337d953ED6c9eB130840D04c249973e5 \
  "submitRebalanceRequest(address,int24,int24,uint256,string,bytes)" \
  0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 \
  100 \
  200 \
  8000 \
  "liquidity-optimizer-v1.0" \
  0x... \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --private-key <AI_MODEL_SIGNER_KEY>
```

## Verification Checklist

### ✅ Core Functionality
- [ ] Vault accepts native SEI deposits
- [ ] Shares are minted correctly (1:1 for first deposit)
- [ ] Withdrawals work and return correct amount
- [ ] TVL calculation is accurate
- [ ] Share price calculation is correct

### ✅ AI Oracle Integration
- [ ] AI model is registered and active
- [ ] Backend can submit rebalance requests
- [ ] Rebalance requests are executed successfully
- [ ] Only AIOracle can call vault's rebalance function
- [ ] AI signatures are validated correctly

### ✅ SEI Optimizations
- [ ] Chain ID validation (1328)
- [ ] Parallel execution enabled
- [ ] 400ms rebalance interval enforced
- [ ] SEI finality optimization active
- [ ] Native SEI handling (address(0))

### ✅ User Tracking
- [ ] Total deposited tracked per user
- [ ] Total withdrawn tracked per user
- [ ] Net position calculated correctly
- [ ] Deposit timestamp recorded
- [ ] Lock period enforced (if applicable)

### ✅ Security
- [ ] Owner-only functions protected
- [ ] Reentrancy guards working
- [ ] AI Oracle authorization enforced
- [ ] SEI chain validation working
- [ ] Zero-address checks in place

## Common Issues & Solutions

### Issue: "Invalid AI signature"
**Solution:** Model not registered or wrong signer
```bash
cd backend-signer
npm run register-model
```

### Issue: "Unauthorized AI"
**Solution:** AIOracle address not set in vault
```bash
# Check current AI Oracle
cast call 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 "aiOracle()(address)" --rpc-url https://evm-rpc-testnet.sei-apis.com

# If it's zero address, redeploy vault
```

### Issue: "Rebalance too frequent"
**Solution:** Wait 400ms between rebalances (SEI finality)
```bash
# Check last rebalance time
cast call 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 "lastRebalance()(uint256)" --rpc-url https://evm-rpc-testnet.sei-apis.com
```

### Issue: "Request expired"
**Solution:** Deadline passed, submit new request
- Default deadline: 5 minutes from submission

### Issue: Deposit reverts with "Use seiOptimizedDeposit"
**Solution:** Use the SEI-optimized deposit function, not standard ERC4626
```bash
# Wrong:
cast send --value 1000000000000000000 ...

# Correct:
cast send ... "seiOptimizedDeposit(uint256,address)" ... --value ...
```

## Monitoring & Analytics

### Check Vault State
```bash
# TVL
cast call 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 "totalAssets()(uint256)" --rpc-url https://evm-rpc-testnet.sei-apis.com

# Total Shares
cast call 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 "totalSupply()(uint256)" --rpc-url https://evm-rpc-testnet.sei-apis.com

# Share Price
cast call 0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0 "convertToAssets(uint256)(uint256)" 1000000000000000000 --rpc-url https://evm-rpc-testnet.sei-apis.com
```

### Check AI Model Performance
```bash
cast call 0xA3437847337d953ED6c9eB130840D04c249973e5 \
  "getModelPerformance(string)(uint256,uint256,bool)" \
  "liquidity-optimizer-v1.0" \
  --rpc-url https://evm-rpc-testnet.sei-apis.com
```

### View Transactions
- Vault: https://seitrace.com/address/0xD460d6C569631A1BDc6FAF28D47BF376aFDD90D0?chain=atlantic-2
- AI Oracle: https://seitrace.com/address/0xA3437847337d953ED6c9eB130840D04c249973e5?chain=atlantic-2

## Frontend Testing

### Start Services
```bash
# Terminal 1: Backend Signer
cd backend-signer
npm run dev

# Terminal 2: AI Engine (if running locally)
cd ai-engine
python main.py

# Terminal 3: Frontend
cd yield-delta-frontend
npm run dev
```

### Test Flow
1. **Connect Wallet**: Click "Connect Wallet" and select MetaMask
2. **Check Dashboard**: Should show vault TVL, your balance, APY
3. **Make Deposit**:
   - Enter amount (e.g., 1 SEI)
   - Click "Deposit"
   - Confirm in MetaMask
   - Wait for confirmation
   - Balance should update
4. **Wait for Rebalance**: Backend runs every 5 minutes
5. **Check History**: View rebalance events
6. **Make Withdrawal**:
   - Enter shares to withdraw
   - Click "Withdraw"
   - Confirm in MetaMask
   - Receive SEI back

## Performance Benchmarks

### Expected Transaction Times (SEI Testnet)
- Deposit: ~2-3 seconds
- Withdrawal: ~2-3 seconds
- Rebalance Request: ~2-3 seconds
- Rebalance Execution: ~2-3 seconds
- Block Time: ~400ms (SEI finality)

### Gas Costs (Approximate)
- Deposit: ~150,000 gas
- Withdrawal: ~120,000 gas
- Rebalance Request: ~190,000 gas
- Rebalance Execution: ~85,000 gas

## Next Steps

1. **Load Testing**: Test with multiple users depositing/withdrawing
2. **Stress Testing**: Test rebalancing under high frequency
3. **Integration Testing**: Test full flow from deposit → rebalance → withdrawal
4. **Frontend Testing**: Test all UI interactions
5. **Mobile Testing**: Test on mobile wallets
6. **Security Audit**: Review all access controls and validations

## Support

- **GitHub Issues**: https://github.com/anthropics/claude-code/issues
- **SEI Docs**: https://docs.sei.io/
- **Contract Source**: `/workspaces/yield-delta-protocol/contracts/src/SEIVault.sol`
