# Plugin SEI Yield Delta - Migration Guide

**Date:** November 16, 2024
**Plugin Location:** `kairos/node_modules/@elizaos/plugin-sei-yield-delta`

This guide documents all changes made to the `plugin-sei-yield-delta` for migration to other GitHub Codespaces or environments.

---

## 📋 Changes Summary

### 1. **DragonSwap GraphQL API Integration**
### 2. **Updated Vault Contract Addresses**
### 3. **Environment Configuration Updates**

---

## 🔧 Detailed Changes

### 1. DragonSwap GraphQL API Integration

**File Modified:** `src/providers/dragonswap-api.ts`

#### Changes Made:

**a) Added GraphQL Endpoint**
```typescript
// Line 59: Added graphqlUrl property
private graphqlUrl: string;

// Lines 68-69: Initialized GraphQL endpoint in constructor
this.graphqlUrl = 'https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn';
```

**b) Added GraphQL Query Method**
```typescript
// Lines 262-289: New private method for GraphQL queries
private async queryGraphQL(query: string, variables?: Record<string, any>): Promise<any>
```

**c) Added New Public Methods** (Lines 294-457):

1. **getPoolDataFromSubgraph(poolAddress: string)** - Get detailed pool data
2. **getTopPools(limit: number = 10)** - Get top pools by volume
3. **getTokenPrice(tokenAddress: string)** - Get token price from subgraph
4. **getRecentSwaps(poolAddress: string, limit: number = 10)** - Get recent swaps
5. **findPoolByTokens(token0Symbol: string, token1Symbol: string)** - Search pools by token symbols
6. **getUserPositions(userAddress: string)** - Get user's liquidity positions

**d) Updated getPoolInfo Method** (Lines 82-116):
- Added fallback to GraphQL when REST API fails
- Automatically finds best pool by liquidity
- Improved error handling

---

### 2. Updated Vault Contract Addresses

All contract addresses updated to reflect the **November 16, 2024 deployment** on SEI Testnet (Chain ID 1328).

#### New Addresses:

| Contract | Address |
|----------|---------|
| **Native SEI Vault** | `0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9` |
| **AI Oracle** | `0x8d6870cAEF6B62251f6056550336343C056569AD` |
| **Vault Factory** | `0x42bC207Ad68d05223Bf4520D75C0475d6978c48f` |

#### Files Updated:

**Kairos Agent:**
- `kairos/.env` - Updated contract addresses and network config

**Frontend:**
- `yield-delta-frontend/src/app/api/vaults/route.ts:35`
- `yield-delta-frontend/.env.production:13-17`
- `yield-delta-frontend/.env.example:8-12`
- `yield-delta-frontend/wrangler.toml:28-32, 65-69`

---

### 3. Environment Configuration Updates

**File Modified:** `kairos/.env`

#### Changes:

```bash
# Network Configuration
SEI_NETWORK=sei-testnet  # Changed from mainnet
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com  # Changed to testnet RPC

# New: DragonSwap GraphQL Endpoint
DRAGONSWAP_GRAPHQL_URL=https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn

# Deployed Contract Addresses (SEI Testnet - Nov 16 2024)
NATIVE_SEI_VAULT=0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9
AI_ORACLE=0x8d6870cAEF6B62251f6056550336343C056569AD
VAULT_FACTORY=0x42bC207Ad68d05223Bf4520D75C0475d6978c48f
```

---

## 🚀 Migration Steps

### For New GitHub Codespaces or Environments

#### Step 1: Copy Modified Plugin File

```bash
# From your current environment
cp kairos/node_modules/@elizaos/plugin-sei-yield-delta/src/providers/dragonswap-api.ts ~/dragonswap-api-backup.ts

# In new environment, after npm/bun install
cp ~/dragonswap-api-backup.ts kairos/node_modules/@elizaos/plugin-sei-yield-delta/src/providers/dragonswap-api.ts
```

#### Step 2: Rebuild the Plugin

```bash
cd kairos/node_modules/@elizaos/plugin-sei-yield-delta
bun install  # If needed
bun run build
```

Expected output:
```
✓ Build success in ~1-2s
✓ dist/index.mjs created
✓ dist/index.d.mts created
```

#### Step 3: Update Environment Variables

Copy these settings to `kairos/.env`:

```bash
# SEI Yield Delta Plugin Configuration
SEI_PRIVATE_KEY=your-private-key-here
SEI_NETWORK=sei-testnet
SEI_RPC_URL=https://evm-rpc-testnet.sei-apis.com
DRAGONSWAP_GRAPHQL_URL=https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn

# Deployed Contract Addresses (SEI Testnet - Nov 16 2024)
NATIVE_SEI_VAULT=0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9
AI_ORACLE=0x8d6870cAEF6B62251f6056550336343C056569AD
VAULT_FACTORY=0x42bC207Ad68d05223Bf4520D75C0475d6978c48f
```

#### Step 4: Update Frontend Configuration

Update these files with new vault addresses:

**yield-delta-frontend/.env.production:**
```bash
NEXT_PUBLIC_NATIVE_SEI_VAULT=0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9
NEXT_PUBLIC_AI_ORACLE=0x8d6870cAEF6B62251f6056550336343C056569AD
NEXT_PUBLIC_VAULT_FACTORY=0x42bC207Ad68d05223Bf4520D75C0475d6978c48f
NEXT_PUBLIC_VAULT_ADDRESS=0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9
```

**yield-delta-frontend/src/app/api/vaults/route.ts:**
```typescript
// Line 35
address: '0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9', // Native SEI Vault (NEW DEPLOYMENT - Nov 16 2024)
```

#### Step 5: Verify Installation

```bash
# Test the plugin
cd kairos
elizaos start --dev

# Or test locally
bun run dev
```

---

## 🔍 Testing the Changes

### Test DragonSwap GraphQL Integration

```typescript
import { DragonSwapProvider } from '@elizaos/plugin-sei-yield-delta';

const provider = new DragonSwapProvider();

// Test pool search
const pools = await provider.findPoolByTokens('SEI', 'USDC');
console.log('Found pools:', pools);

// Test top pools
const topPools = await provider.getTopPools(5);
console.log('Top 5 pools:', topPools);

// Test pool info (with GraphQL fallback)
const poolInfo = await provider.getPoolInfo('SEI', 'USDC');
console.log('Pool info:', poolInfo);
```

### Test Vault Deployment

```bash
# Verify vault is deployed
cast code 0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9 --rpc-url https://evm-rpc-testnet.sei-apis.com

# Should return bytecode starting with 0x608060405...
```

---

## 📊 New Capabilities

With the GraphQL integration, the plugin now supports:

1. **Real-time Pool Data** - Query any DragonSwap pool by address
2. **Token Discovery** - Find pools by token symbols
3. **Price Feeds** - Get token prices from the subgraph
4. **Liquidity Analytics** - Track top pools and liquidity positions
5. **Swap History** - View recent swaps for any pool
6. **User Positions** - Query user liquidity positions

---

## 🛠️ Troubleshooting

### Plugin Build Fails

```bash
# Clean and rebuild
cd kairos/node_modules/@elizaos/plugin-sei-yield-delta
rm -rf dist
bun run build
```

### GraphQL Queries Failing

Check if the endpoint is accessible:
```bash
curl -X POST https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn \
  -H "Content-Type: application/json" \
  -d '{"query": "{ pools(first: 1) { id } }"}'
```

### Vault Connection Issues

1. Check network configuration: `SEI_NETWORK=sei-testnet`
2. Verify RPC URL: `https://evm-rpc-testnet.sei-apis.com`
3. Confirm vault address: `0x6C9575ED46875114004007aCcB5C9F39C2Ac86c9`

---

## 📝 Notes

- All changes are in `node_modules` which is gitignored
- **Important:** Reapply changes after `npm install` or `bun install`
- Consider creating a post-install script to automate migration
- The GraphQL endpoint is public and doesn't require authentication
- Vault contracts are deployed on SEI **testnet** (Chain ID 1328)

---

## 🔗 References

- **DragonSwap GraphQL Endpoint:** https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn
- **SEI Testnet RPC:** https://evm-rpc-testnet.sei-apis.com
- **Deployment Summary:** See `/workspaces/yield-delta-protocol/DEPLOYMENT_SUMMARY.md`
- **DragonSwap Docs:** https://docs.dragonswap.app/

---

## ✅ Checklist for Migration

- [ ] Copy modified `dragonswap-api.ts` file
- [ ] Rebuild plugin (`bun run build`)
- [ ] Update `kairos/.env` with new addresses
- [ ] Update frontend `.env.production`
- [ ] Update frontend `vaults/route.ts`
- [ ] Update frontend `.env.example`
- [ ] Update frontend `wrangler.toml`
- [ ] Test GraphQL queries
- [ ] Verify vault deployment
- [ ] Test wallet connection
- [ ] Test deposit functionality

---

**Last Updated:** November 16, 2024
**Migration Difficulty:** Easy (copy + rebuild)
**Estimated Time:** 10-15 minutes
