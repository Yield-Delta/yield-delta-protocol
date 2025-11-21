# SEI Oracle Provider Fix - plugin-sei-yield-delta

## Issue Summary

The `sei-oracle.ts` provider in `@elizaos/plugin-sei-yield-delta` has incorrect contract addresses and ABI calls causing price fetch failures on SEI network.

## Error Messages

```
Pyth price fetch error for ETH: ContractFunctionExecutionError: The contract function "queryPriceFeed" reverted with the following signature:
0x14aebe68

Chainlink price fetch error for BTC/ETH/SEI: ContractFunctionExecutionError: The contract function "latestRoundData" returned no data ("0x").
```

## Root Causes

1. **Wrong Pyth ABI**: Using `queryPriceFeed` instead of `getPriceUnsafe`
2. **Wrong network for Pyth**: Using `seiChains.devnet` instead of `seiChains.mainnet`
3. **Invalid Chainlink addresses**: Using Ethereum mainnet address `0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419` which doesn't exist on SEI
4. **Chainlink not available**: Chainlink doesn't have standard price feeds on SEI network

## Required Fixes

### 1. Update `src/providers/sei-oracle.ts`

#### Fix 1: Remove Chainlink feeds (lines ~73-77)

**Before:**
```typescript
chainlinkFeeds: {
  'BTC/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
  'SEI/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
},
```

**After:**
```typescript
// Chainlink is not available on SEI - these feeds are disabled
chainlinkFeeds: {},
```

#### Fix 2: Update Pyth price fetch function (lines ~287-340)

**Before:**
```typescript
private async getPythPrice(symbol: string): Promise<PriceFeed | null> {
  try {
    const feedId = this.config.pythPriceFeeds[symbol];
    if (!feedId) return null;

    const publicClient = createPublicClient({
      chain: seiChains.devnet,
      transport: http()
    });

    const result = await publicClient.readContract({
      address: '0x2880aB155794e7179c9eE2e38200202908C17B43' as `0x${string}`,
      abi: [
        {
          name: 'queryPriceFeed',
          type: 'function',
          inputs: [{ name: 'id', type: 'bytes32' }],
          outputs: [
            { name: 'price', type: 'int64' },
            { name: 'conf', type: 'uint64' },
            { name: 'expo', type: 'int32' },
            { name: 'publishTime', type: 'uint256' }
          ]
        }
      ] as const,
      functionName: 'queryPriceFeed',
      args: [feedId as `0x${string}`]
    }) as readonly [bigint, bigint, number, bigint];

    if (!result || result[0] === BigInt(0)) {
      return null;
    }

    const price = Number(result[0]) / Math.pow(10, 8);
    const confidence = Number(result[1]) / Math.pow(10, 8);
    const timestamp = Number(result[3]) * 1000;

    if (isNaN(price) || price <= 0) {
      return null;
    }

    return {
      symbol,
      price,
      timestamp,
      source: 'pyth',
      confidence
    };
  } catch (error) {
    elizaLogger.error(`Pyth price fetch error for ${symbol}: ${error}`);
    return null;
  }
}
```

**After:**
```typescript
private async getPythPrice(symbol: string): Promise<PriceFeed | null> {
  try {
    const feedId = this.config.pythPriceFeeds[symbol];
    if (!feedId) return null;

    // Use SEI mainnet for Pyth - the contract is deployed there
    const publicClient = createPublicClient({
      chain: seiChains.mainnet,
      transport: http()
    });

    // Pyth EVM uses getPriceUnsafe which returns a Price struct
    const result = await publicClient.readContract({
      address: '0x2880aB155794e7179c9eE2e38200202908C17B43' as `0x${string}`,
      abi: [
        {
          name: 'getPriceUnsafe',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'id', type: 'bytes32' }],
          outputs: [
            {
              name: 'price',
              type: 'tuple',
              components: [
                { name: 'price', type: 'int64' },
                { name: 'conf', type: 'uint64' },
                { name: 'expo', type: 'int32' },
                { name: 'publishTime', type: 'uint256' }
              ]
            }
          ]
        }
      ] as const,
      functionName: 'getPriceUnsafe',
      args: [feedId as `0x${string}`]
    }) as { price: bigint; conf: bigint; expo: number; publishTime: bigint };

    if (!result || result.price === BigInt(0)) {
      return null;
    }

    // Calculate price: price * 10^expo
    const priceValue = Number(result.price) * Math.pow(10, result.expo);
    const confidence = Number(result.conf) * Math.pow(10, result.expo);
    const timestamp = Number(result.publishTime) * 1000;

    if (isNaN(priceValue) || priceValue <= 0) {
      return null;
    }

    return {
      symbol,
      price: priceValue,
      timestamp,
      source: 'pyth',
      confidence
    };
  } catch (error) {
    elizaLogger.error(`Pyth price fetch error for ${symbol}: ${error}`);
    return null;
  }
}
```

#### Fix 3: Simplify Chainlink function (lines ~342-393)

**Before:** (full implementation trying to call Chainlink)

**After:**
```typescript
private async getChainlinkPrice(symbol: string): Promise<PriceFeed | null> {
  // Chainlink is not available on SEI network
  // This function is kept for interface compatibility but always returns null
  return null;
}
```

#### Fix 4: Update fallback order in `getPrice` function (lines ~211-214)

**Before:**
```typescript
// Other fallbacks for real price data
if (!price) price = await this.getPythPrice(symbol);
if (!price) price = await this.getChainlinkPrice(symbol);
if (!price) price = await this.getCexPrice(symbol);
```

**After:**
```typescript
// Other fallbacks for real price data
// Priority: Pyth (on-chain) -> CEX (Binance API - most reliable)
// Note: Chainlink is not available on SEI
if (!price) price = await this.getPythPrice(symbol);
if (!price) price = await this.getCexPrice(symbol);
```

## Testing

After applying these fixes, test with:
1. Price query for SEI, ETH, BTC
2. Verify Binance CEX fallback works when Pyth fails
3. Confirm no more Chainlink errors in logs

## References

- Pyth EVM Contract Addresses: https://docs.pyth.network/price-feeds/contract-addresses/evm
- Pyth EVM ABI: https://docs.pyth.network/price-feeds/use-real-time-data/evm
- SEI Network Docs: https://docs.sei.io/evm/oracles
