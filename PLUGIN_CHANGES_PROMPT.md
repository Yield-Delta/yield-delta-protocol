# Plugin SEI Yield Delta - Code Changes for Separate Repository

**Use this entire file as a prompt to apply changes in the plugin's own repository/Codespaces**

---

## Prompt for Claude/AI Assistant:

Please apply the following changes to the `@elizaos/plugin-sei-yield-delta` codebase:

---

## Change 1: Update DragonSwap Provider with GraphQL API

**File:** `src/providers/dragonswap-api.ts`

### Step 1: Add GraphQL URL to the class constructor

**Find this section (around lines 57-77):**
```typescript
export class DragonSwapProvider {
  private baseUrl: string;
  private walletProvider?: WalletProvider;
  private routerAddress: `0x${string}`;

  constructor(apiUrl?: string, walletProvider?: WalletProvider, isTestnet: boolean = false) {
    this.baseUrl = apiUrl || (isTestnet
      ? 'https://api-testnet.dragonswap.app/v1'
      : 'https://api.dragonswap.app/v1');
    this.walletProvider = walletProvider;

    // Replace with actual DragonSwap router contract addresses
    this.routerAddress = isTestnet
      ? '0x1234567890123456789012345678901234567890' as `0x${string}`  // Mock testnet router
      : '0x1234567890123456789012345678901234567890' as `0x${string}`; // Mock mainnet router
  }
```

**Replace with:**
```typescript
export class DragonSwapProvider {
  private baseUrl: string;
  private graphqlUrl: string;
  private walletProvider?: WalletProvider;
  private routerAddress: `0x${string}`;

  constructor(apiUrl?: string, walletProvider?: WalletProvider, isTestnet: boolean = false) {
    this.baseUrl = apiUrl || (isTestnet
      ? 'https://api-testnet.dragonswap.app/v1'
      : 'https://api.dragonswap.app/v1');

    // DragonSwap V3 GraphQL API on Goldsky
    this.graphqlUrl = 'https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn';

    this.walletProvider = walletProvider;

    // Replace with actual DragonSwap router contract addresses
    this.routerAddress = isTestnet
      ? '0x1234567890123456789012345678901234567890' as `0x${string}`  // Mock testnet router
      : '0x1234567890123456789012345678901234567890' as `0x${string}`; // Mock mainnet router
  }
```

---

### Step 2: Update getPoolInfo method with GraphQL fallback

**Find the getPoolInfo method (around lines 79-89):**
```typescript
  async getPoolInfo(tokenA: string, tokenB: string): Promise<DragonSwapPoolInfo | null> {
    try {
      const response = await fetch(`${this.baseUrl}/pools/${tokenA.toLowerCase()}/${tokenB.toLowerCase()}`);
      if (!response.ok) {
        elizaLogger.warn(`DragonSwap pool info not found for ${tokenA}/${tokenB}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      elizaLogger.error(`Failed to get DragonSwap pool info:: ${error}`);
      return null;
    }
  }
```

**Replace with:**
```typescript
  async getPoolInfo(tokenA: string, tokenB: string): Promise<DragonSwapPoolInfo | null> {
    try {
      // Try REST API first
      const response = await fetch(`${this.baseUrl}/pools/${tokenA.toLowerCase()}/${tokenB.toLowerCase()}`);
      if (response.ok) {
        return await response.json();
      }

      // Fallback to GraphQL subgraph
      elizaLogger.log(`REST API failed, trying GraphQL for ${tokenA}/${tokenB}`);
      const pools = await this.findPoolByTokens(tokenA, tokenB);

      if (pools && pools.length > 0) {
        // Return the pool with highest liquidity
        const bestPool = pools.sort((a, b) =>
          parseFloat(b.liquidity) - parseFloat(a.liquidity)
        )[0];

        return {
          address: bestPool.id,
          token0: bestPool.token0.id,
          token1: bestPool.token1.id,
          fee: bestPool.feeTier || 3000,
          liquidity: bestPool.liquidity,
          price: "0" // Would need additional calculation
        };
      }

      elizaLogger.warn(`DragonSwap pool info not found for ${tokenA}/${tokenB}`);
      return null;
    } catch (error) {
      elizaLogger.error(`Failed to get DragonSwap pool info:: ${error}`);
      return null;
    }
  }
```

---

### Step 3: Add GraphQL Query Methods

**Find the buildSwapCalldata method (around line 257):**
```typescript
  /**
   * Build calldata for swap transaction
   */
  private buildSwapCalldata(params: DragonSwapTradeParams & {
    minAmountOut: string;
    deadline: number
  }): `0x${string}` {
```

**Add these new methods BEFORE buildSwapCalldata:**
```typescript
  /**
   * Query DragonSwap GraphQL API
   */
  private async queryGraphQL(query: string, variables?: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ query, variables })
      });

      if (!response.ok) {
        elizaLogger.warn(`GraphQL query failed: ${response.status} ${response.statusText}`);
        return null;
      }

      const result = await response.json();
      if (result.errors) {
        elizaLogger.error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
        return null;
      }

      return result.data;
    } catch (error) {
      elizaLogger.error(`GraphQL query error:: ${error}`);
      return null;
    }
  }

  /**
   * Get pool data from GraphQL subgraph
   */
  async getPoolDataFromSubgraph(poolAddress: string): Promise<any> {
    const query = `
      query GetPool($poolAddress: String!) {
        pool(id: $poolAddress) {
          id
          token0 {
            id
            symbol
            name
            decimals
          }
          token1 {
            id
            symbol
            name
            decimals
          }
          liquidity
          sqrtPrice
          tick
          feeTier
          volumeUSD
          txCount
        }
      }
    `;

    return await this.queryGraphQL(query, { poolAddress: poolAddress.toLowerCase() });
  }

  /**
   * Get top pools by volume
   */
  async getTopPools(limit: number = 10): Promise<any[]> {
    const query = `
      query GetTopPools($limit: Int!) {
        pools(first: $limit, orderBy: volumeUSD, orderDirection: desc) {
          id
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          volumeUSD
          liquidity
          feeTier
        }
      }
    `;

    const data = await this.queryGraphQL(query, { limit });
    return data?.pools || [];
  }

  /**
   * Get token price from GraphQL
   */
  async getTokenPrice(tokenAddress: string): Promise<number | null> {
    const query = `
      query GetToken($tokenAddress: String!) {
        token(id: $tokenAddress) {
          derivedETH
          volume
          volumeUSD
          txCount
        }
      }
    `;

    const data = await this.queryGraphQL(query, { tokenAddress: tokenAddress.toLowerCase() });
    if (data?.token?.derivedETH) {
      return parseFloat(data.token.derivedETH);
    }
    return null;
  }

  /**
   * Get recent swaps for a pool
   */
  async getRecentSwaps(poolAddress: string, limit: number = 10): Promise<any[]> {
    const query = `
      query GetSwaps($poolAddress: String!, $limit: Int!) {
        swaps(
          first: $limit,
          orderBy: timestamp,
          orderDirection: desc,
          where: { pool: $poolAddress }
        ) {
          id
          timestamp
          amount0
          amount1
          amountUSD
          sender
          recipient
        }
      }
    `;

    const data = await this.queryGraphQL(query, { poolAddress: poolAddress.toLowerCase(), limit });
    return data?.swaps || [];
  }

  /**
   * Search pools by token symbols
   */
  async findPoolByTokens(token0Symbol: string, token1Symbol: string): Promise<any[]> {
    const query = `
      query FindPools($token0: String!, $token1: String!) {
        pools(
          where: {
            or: [
              { and: [{ token0_contains_nocase: $token0 }, { token1_contains_nocase: $token1 }] },
              { and: [{ token0_contains_nocase: $token1 }, { token1_contains_nocase: $token0 }] }
            ]
          }
        ) {
          id
          token0 {
            symbol
            id
          }
          token1 {
            symbol
            id
          }
          liquidity
          volumeUSD
          feeTier
        }
      }
    `;

    const data = await this.queryGraphQL(query, { token0: token0Symbol, token1: token1Symbol });
    return data?.pools || [];
  }

  /**
   * Get liquidity positions for an address
   */
  async getUserPositions(userAddress: string): Promise<any[]> {
    const query = `
      query GetPositions($userAddress: String!) {
        positions(where: { owner: $userAddress }) {
          id
          liquidity
          token0 {
            symbol
          }
          token1 {
            symbol
          }
          pool {
            id
            feeTier
          }
        }
      }
    `;

    const data = await this.queryGraphQL(query, { userAddress: userAddress.toLowerCase() });
    return data?.positions || [];
  }

  /**
   * Build calldata for swap transaction
   */
  private buildSwapCalldata(params: DragonSwapTradeParams & {
    minAmountOut: string;
    deadline: number
  }): `0x${string}` {
```

---

## Summary of Changes

### What was added:
1. **graphqlUrl property** - Points to DragonSwap V3 Goldsky subgraph
2. **queryGraphQL method** - Private method for making GraphQL queries
3. **6 new public methods:**
   - `getPoolDataFromSubgraph()` - Get detailed pool data
   - `getTopPools()` - Get top pools by volume
   - `getTokenPrice()` - Get token price
   - `getRecentSwaps()` - Get swap history
   - `findPoolByTokens()` - Search pools by token pair
   - `getUserPositions()` - Get user's LP positions

### What was modified:
- **getPoolInfo method** - Now tries REST API first, falls back to GraphQL subgraph

### Why these changes:
- DragonSwap's REST API may not always be available
- GraphQL subgraph provides real-time, reliable data
- Enables advanced features like pool discovery, price feeds, and analytics
- Better support for Kairos agent's DeFi strategies

---

## Testing the Changes

After applying changes, test with:

```typescript
import { DragonSwapProvider } from './src/providers/dragonswap-api';

const provider = new DragonSwapProvider();

// Test GraphQL integration
const pools = await provider.getTopPools(5);
console.log('Top 5 pools:', pools);

// Test pool search
const seiUsdcPools = await provider.findPoolByTokens('SEI', 'USDC');
console.log('SEI/USDC pools:', seiUsdcPools);

// Test fallback in getPoolInfo
const poolInfo = await provider.getPoolInfo('SEI', 'USDC');
console.log('Pool info:', poolInfo);
```

---

## Build & Verify

```bash
# Build the plugin
bun run build

# Expected output:
# ✓ Build success
# ✓ dist/index.mjs created
# ✓ dist/index.d.mts created
```

---

## Additional Context

**DragonSwap GraphQL Endpoint:**
```
https://api.goldsky.com/api/public/project_clu1fg6ajhsho01x7ajld3f5a/subgraphs/dragonswap-v3-prod/1.0.5/gn
```

This is a public endpoint (no auth required) that provides:
- Real-time pool data
- Token prices
- Swap history
- Liquidity positions
- Volume analytics

**Network:** SEI Network (mainnet and testnet)
**Protocol:** DragonSwap V3 (Uniswap V3 fork)

---

**End of changes. Please apply these modifications to the plugin repository.**
